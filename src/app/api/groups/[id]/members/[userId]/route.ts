import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, userId: string }> }) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id: groupId, userId } = await params

    // Security: Users can only remove themselves
    if (sessionUser.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId, leftAt: null }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Membership not found or already left' }, { status: 404 })
    }

    // Check balance: User must have exactly 0 balance to leave.
    // Calculate balances for this group.
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true }
    })
    
    const settlements = await prisma.settlement.findMany({
      where: { groupId }
    })

    const balances: Record<string, number> = {}

    for (const expense of expenses) {
      balances[expense.paidById] = (balances[expense.paidById] || 0) + expense.inrEquivalentCents
      for (const split of expense.splits) {
        balances[split.userId] = (balances[split.userId] || 0) - split.amountOwedCents
      }
    }

    for (const settlement of settlements) {
      balances[settlement.payerId] = (balances[settlement.payerId] || 0) + settlement.amountCents
      balances[settlement.payeeId] = (balances[settlement.payeeId] || 0) - settlement.amountCents
    }

    const userBalance = balances[userId] || 0
    // Allow small 1-2 cent rounding drift
    if (Math.abs(userBalance) > 2) {
      return NextResponse.json({ 
        error: `Cannot leave group with an outstanding balance. Please settle your debts first.` 
      }, { status: 400 })
    }

    // Mark as left
    await prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leave group error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
