import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, expenseId: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id: groupId, expenseId } = await params

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        group: { select: { id: true } }
      }
    })

    if (!expense || expense.groupId !== groupId) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Security: Only the person who paid the expense OR an active member can delete it.
    // For simplicity and safety, any active member can delete an expense in the group.
    const activeMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.userId, leftAt: null }
    })
    
    if (!activeMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete expense error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
