import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export interface Session {
  userId: string
  xUsername: string
  xUserId?: string
}

const COOKIE_NAME = 'xcreator_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/** Encode a session into a base64 cookie value */
export function createSessionCookie(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString('base64')
}

/** Decode a cookie value back into a Session */
export function parseSessionCookie(value: string): Session {
  return JSON.parse(Buffer.from(value, 'base64').toString()) as Session
}

/** Set the session cookie on a NextResponse (new-style callbacks) */
export function setSession(response: NextResponse, session: Session) {
  response.cookies.set(COOKIE_NAME, createSessionCookie(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/** Read the current session from the incoming request cookies */
export function getSession(): Session | null {
  try {
    const cookieStore = cookies()
    const cookie = cookieStore.get(COOKIE_NAME)
    if (!cookie?.value) return null
    return parseSessionCookie(cookie.value)
  } catch {
    return null
  }
}
