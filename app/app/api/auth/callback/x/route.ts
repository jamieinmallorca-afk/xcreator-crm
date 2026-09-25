import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getXUser } from '@/lib/x-api'
import { createSessionCookie } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=oauth_denied`)
  }

  // Verify CSRF state
  const storedState = request.cookies.get('x_oauth_state')?.value
  const codeVerifier = request.cookies.get('x_code_verifier')?.value

  if (state !== storedState || !codeVerifier) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=state_mismatch`)
  }

  try {
    // Exchange authorisation code for tokens
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_X_REDIRECT_URI!,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      console.error('Token exchange failed:', body)
      return NextResponse.redirect(`${appUrl}/dashboard?error=token_exchange_failed`)
    }

    const tokens = await tokenRes.json()

    // Get X user details
    const xUser = await getXUser(tokens.access_token)

    // Upsert profile in Supabase
    const db = createAdminClient()
    const { data: profile, error: dbError } = await db
      .from('profiles')
      .upsert(
        {
          x_user_id: xUser.id,
          x_username: xUser.username,
          x_display_name: xUser.name,
          x_access_token: tokens.access_token,
          x_refresh_token: tokens.refresh_token ?? null,
          x_token_expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'x_user_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (dbError) {
      console.error('DB upsert error:', dbError)
      return NextResponse.redirect(`${appUrl}/dashboard?error=db_error`)
    }

    // Set session cookie
    const sessionValue = createSessionCookie({
      userId: profile.id,
      xUserId: xUser.id,
      xUsername: xUser.username,
    })

    const response = NextResponse.redirect(`${appUrl}/dashboard?connected=true`)
    response.cookies.set('xcreator_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    response.cookies.delete('x_oauth_state')
    response.cookies.delete('x_code_verifier')

    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/dashboard?error=server_error`)
  }
}
