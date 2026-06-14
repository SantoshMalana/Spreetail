import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { joinedAt: 'asc' }
        }
      }
    })

    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    // Security: Only group members can view it
    const isMember = group.members.some(m => m.userId === user.userId)
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Get group error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    // Security: Must be an active member to edit the name
    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.userId, leftAt: null }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const group = await prisma.group.update({
      where: { id },
      data: { name: name.trim() }
    })

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Update group error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
