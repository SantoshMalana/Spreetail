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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string, expenseId: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { expenseId } = await params
    const { content } = await request.json()

    if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    const comment = await prisma.expenseComment.create({
      data: {
        expenseId,
        userId: user.userId,
        content
      },
      include: {
        user: { select: { name: true } }
      }
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
