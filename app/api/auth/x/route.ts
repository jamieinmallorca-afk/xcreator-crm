import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'

export async function GET(request: NextRequest) {
  const clientId = process.env.X_CLIENT_ID!
  const redirectUri = process.env.NEXT_PUBLIC_X_REDIRECT_URI!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=missing_client_id`)
  }

  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  const nonce = randomBytes(16).toString('hex')

  // Encode both nonce and codeVerifier in state — avoids cookie issues on Vercel edge
  const state = Buffer.from(`${nonce}|${codeVerifier}`).toString('base64url')

  const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'tweet.read users.read follows.read offline.access')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  return NextResponse.redirect(authUrl.toString())
}
