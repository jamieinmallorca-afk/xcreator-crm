import { cookies } from 'next/headers'

export interface SessionUser {
  userId: string
  xUserId: string
  xUsername: string
}

export function getSession(): SessionUser | null {
  const cookieStore = cookies()
  const raw = cookieStore.get('xcreator_session')?.value
  if (!raw) return null
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as SessionUser
  } catch {
    return null
  }
}

export function createSessionCookie(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64')
}
