import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: { name: name.trim() }
    })

    // We must refresh the JWT cookie since it stores the user's name
    const token = await signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name
    })

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
