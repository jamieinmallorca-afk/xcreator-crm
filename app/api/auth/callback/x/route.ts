import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { setSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code || !stateParam) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', appUrl))
  }

  let codeVerifier: string
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString())
    codeVerifier = decoded.codeVerifier
  } catch {
    return NextResponse.redirect(new URL('/?error=invalid_state', appUrl))
  }

  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.X_CLIENT_ID!}:${process.env.X_CLIENT_SECRET!}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${appUrl}/api/auth/callback/x`,
      client_id: process.env.X_CLIENT_ID!,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    console.error('Token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', appUrl))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
    token_type: string
  }

  const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=name,profile_image_url', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(new URL('/?error=user_fetch_failed', appUrl))
  }

  const { data: xUser } = await userRes.json() as {
    data: { id: string; username: string; name: string; profile_image_url?: string }
  }

  const db = createAdminClient()

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null

  const { data: profile, error: upsertError } = await db
    .from('profiles')
    .upsert(
      {
        x_username: xUser.username,
        x_user_id: xUser.id,
        x_access_token: tokens.access_token,
        x_refresh_token: tokens.refresh_token ?? null,
        x_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'x_user_id', ignoreDuplicates: false }
    )
    .select('id, onboarding_completed')
    .single()

  if (upsertError || !profile) {
    console.error('Profile upsert error:', upsertError)
    return NextResponse.redirect(new URL('/?error=profile_error', appUrl))
  }

  const response = NextResponse.redirect(
    new URL(profile.onboarding_completed ? '/dashboard' : '/onboarding', appUrl)
  )

  setSession(response, {
    userId: profile.id,
    xUsername: xUser.username,
    xUserId: xUser.id,
  })

  return response
}
