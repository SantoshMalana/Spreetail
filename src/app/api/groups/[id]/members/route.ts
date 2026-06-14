import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const { email } = await request.json()

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    // Security: Only active group members can invite
    const activeMember = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: sessionUser.userId, leftAt: null }
    })
    if (!activeMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Find the user to invite
    const userToInvite = await prisma.user.findUnique({ where: { email } })
    if (!userToInvite) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if already a member
    const existingMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: userToInvite.id } }
    })

    if (existingMembership) {
      if (!existingMembership.leftAt) {
        return NextResponse.json({ error: 'User is already an active member' }, { status: 400 })
      } else {
        // Re-join logic: update leftAt to null
        await prisma.groupMember.update({
          where: { id: existingMembership.id },
          data: { leftAt: null, joinedAt: new Date() } // reset joinedAt as they rejoined
        })
        return NextResponse.json({ success: true, message: 'User re-joined group' }, { status: 200 })
      }
    }

    // Add new member
    await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: userToInvite.id,
        joinedAt: new Date()
      }
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Invite member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
