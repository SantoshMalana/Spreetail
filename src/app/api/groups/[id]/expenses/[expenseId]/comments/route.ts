import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string, expenseId: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { expenseId } = await params

    const comments = await prisma.expenseComment.findMany({
      where: { expenseId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { name: true } }
      }
    })

    return NextResponse.json({ comments })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id, expenseId } = await params
    const { content } = await request.json()

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Verify user is in the group
    const activeMember = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: sessionUser.userId, leftAt: null }
    })
    if (!activeMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const comment = await prisma.expenseComment.create({
      data: {
        expenseId,
        userId: sessionUser.userId,
        content: content.trim()
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ comment })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
