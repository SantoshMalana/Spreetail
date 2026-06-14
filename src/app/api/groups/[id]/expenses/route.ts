import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const body = await request.json()
    const { description, amountCents, currency, fxRate, paidById, expenseDate, splits } = body

    // Validate inputs
    if (!description || !amountCents || !paidById || !expenseDate || !splits || splits.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Security: User must be an active member
    const activeMember = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: sessionUser.userId, leftAt: null }
    })
    if (!activeMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Verify paidById is an active member
    const payerMembership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: paidById, leftAt: null }
    })
    if (!payerMembership) return NextResponse.json({ error: 'Payer must be an active group member' }, { status: 400 })

    // Verify all splits sum up to the total INR equivalent
    const inrEquivalentCents = Math.round(amountCents * (fxRate || 1.0))
    const totalSplits = splits.reduce((sum: number, split: any) => sum + split.amountOwedCents, 0)
    
    // Allow minor 1-cent rounding drift per person due to frontend math
    if (Math.abs(totalSplits - inrEquivalentCents) > splits.length) {
      return NextResponse.json({ 
        error: `Split amounts (${totalSplits}) do not sum up to total expense (${inrEquivalentCents})` 
      }, { status: 400 })
    }

    // Create Expense and Splits in a transaction
    const expense = await prisma.expense.create({
      data: {
        groupId: id,
        paidById,
        description,
        amountCents,
        currency: currency || 'INR',
        inrEquivalentCents,
        fxRate: fxRate || 1.0,
        expenseDate: new Date(expenseDate),
        splits: {
          create: splits.map((s: any) => ({
            userId: s.userId,
            amountOwedCents: s.amountOwedCents,
            splitType: s.splitType,
            splitValue: s.splitValue || null
          }))
        }
      },
      include: {
        splits: true,
        paidBy: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params

    const activeMember = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: sessionUser.userId }
    })
    if (!activeMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const expenses = await prisma.expense.findMany({
      where: { groupId: id },
      orderBy: { expenseDate: 'desc' },
      include: {
        paidBy: { select: { id: true, name: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    })

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
