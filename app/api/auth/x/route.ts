import { NextResponse } from 'next/server'
import crypto from 'crypto'

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET() {
  const codeVerifier = base64url(crypto.randomBytes(32))
  const codeChallenge = base64url(
    crypto.createHash('sha256').update(codeVerifier).digest()
  )

  // Encode verifier in state (stateless PKCE — no server-side session needed)
  const state = Buffer.from(JSON.stringify({ codeVerifier })).toString('base64')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.X_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/x`,
    scope: [
      'tweet.read',
      'users.read',
      'follows.read',
      'follows.write',
      'offline.access',
      'dm.read',    // needed for win-back DM feature
      'dm.write',   // needed to send win-back DMs
    ].join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return NextResponse.redirect(
    `https://twitter.com/i/oauth2/authorize?${params.toString()}`
  )
}
