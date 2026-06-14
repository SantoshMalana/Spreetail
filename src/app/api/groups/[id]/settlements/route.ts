import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const body = await request.json()
    const { payerId, payeeId, amountCents } = body

    if (!payerId || !payeeId || !amountCents || amountCents <= 0) {
      return NextResponse.json({ error: 'Invalid settlement parameters' }, { status: 400 })
    }

    // Security check: Make sure user is in the group
    const activeMember = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: sessionUser.userId }
    })
    if (!activeMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const settlement = await prisma.settlement.create({
      data: {
        groupId: id,
        payerId,
        payeeId,
        amountCents
      }
    })

    return NextResponse.json({ settlement }, { status: 201 })
  } catch (error) {
    console.error('Create settlement error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
