import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    
    const { id } = await params

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true }
        },
        expenses: {
          include: {
            paidBy: true,
            splits: { include: { user: true } }
          },
          orderBy: { expenseDate: 'desc' }
        }
      }
    })

    if (!group) return new NextResponse('Group not found', { status: 404 })

    // Security: Must be an active member to export
    const isMember = group.members.some(m => m.userId === user.userId && !m.leftAt)
    if (!isMember) return new NextResponse('Forbidden', { status: 403 })

    // Generate CSV string
    const headers = ['Date', 'Description', 'Category', 'Paid By', 'Total Amount', 'Currency', ...group.members.map(m => `${m.user.name} Owed`)]
    
    const rows = group.expenses.map(exp => {
      const row = [
        new Date(exp.expenseDate).toISOString().split('T')[0],
        `"${exp.description.replace(/"/g, '""')}"`, // escape quotes
        exp.category || '🧾',
        exp.paidBy.name,
        (exp.amountCents / 100).toFixed(2),
        exp.currency
      ]

      // Map each member's owed amount
      group.members.forEach(member => {
        const split = exp.splits.find(s => s.userId === member.userId)
        row.push(split ? (split.amountOwedCents / 100).toFixed(2) : '0.00')
      })

      return row.join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${group.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_expenses.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
