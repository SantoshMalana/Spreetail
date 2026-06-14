import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { GroupDetailsClient } from './GroupDetailsClient'
import { calculateSimplifiedDebts } from '@/lib/balances'

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id } = await params

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: 'asc' }
      },
      expenses: {
        orderBy: { expenseDate: 'desc' },
        include: {
          paidBy: { select: { name: true } },
          splits: true
        }
      },
      settlements: true
    }
  })

  if (!group) {
    return <div className="text-white">Group not found</div>
  }

  // Security check: Only members can view
  const isMember = group.members.some(m => m.userId === user.userId)
  if (!isMember) {
    return <div className="text-white">You don&apos;t have permission to view this group.</div>
  }

  const simplifiedDebts = calculateSimplifiedDebts(group.expenses, group.settlements)

  // Convert dates to string for client component props
  const serializedGroup = {
    ...group,
    members: group.members.map(m => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
      leftAt: m.leftAt?.toISOString() || null
    })),
    expenses: group.expenses.map(e => ({
      ...e,
      expenseDate: e.expenseDate.toISOString(),
      createdAt: e.createdAt.toISOString()
    }))
  }

  return <GroupDetailsClient group={serializedGroup} currentUserId={user.userId} simplifiedDebts={simplifiedDebts} />
}
