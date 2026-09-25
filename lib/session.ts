import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export interface Session {
  userId: string
  xUsername: string
  xUserId?: string
}

const COOKIE_NAME = 'xcreator_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function setSession(response: NextResponse, session: Session) {
  const value = Buffer.from(JSON.stringify(session)).toString('base64')
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export function getSession(): Session | null {
  try {
    const cookieStore = cookies()
    const cookie = cookieStore.get(COOKIE_NAME)
    if (!cookie?.value) return null
    return JSON.parse(Buffer.from(cookie.value, 'base64').toString()) as Session
  } catch {
    return null
  }
}
