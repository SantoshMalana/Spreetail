import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'spreetail-dev-secret-change-in-production'
const COOKIE_NAME = 'spreetail_token'

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('verifyToken failed:', error)
    return null
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  console.log('getSessionUser token:', token ? 'exists' : 'missing')
  if (!token) return null
  const payload = verifyToken(token)
  console.log('getSessionUser payload:', payload ? 'valid' : 'invalid')
  return payload
}

export { COOKIE_NAME }
