import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExpenseChat } from './ExpenseChat'
import { DeleteExpenseButton } from './DeleteExpenseButton'

export default async function ExpenseDetailsPage({ params }: { params: Promise<{ id: string, expenseId: string }> }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id: groupId, expenseId } = await params

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      paidBy: { select: { id: true, name: true, email: true } },
      splits: {
        include: { user: { select: { id: true, name: true } } }
      },
      group: { select: { id: true, name: true } }
    }
  })

  if (!expense || expense.groupId !== groupId) {
    return <div className="text-white">Expense not found</div>
  }

  // Security check: Must be member of the group
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.userId } }
  })
  
  if (!membership) {
    return <div className="text-white">Forbidden</div>
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/groups/${groupId}`} className="hover:text-white transition-colors">
            {expense.group.name}
          </Link>
          <span>›</span>
          <span className="text-gray-300">Expense Details</span>
        </div>
        <DeleteExpenseButton groupId={groupId} expenseId={expenseId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Details */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
            {/* Receipt decoration */}
            <div className="absolute top-0 right-8 w-16 h-24 bg-gray-800/30 rounded-b-lg border border-t-0 border-gray-800/50 flex flex-col items-center pt-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-1">
                🧾
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 pr-20">{expense.description}</h1>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-bold text-emerald-400">
                {expense.currency === 'USD' ? '$' : '₹'}{(expense.amountCents / 100).toFixed(2)}
              </span>
              {expense.currency !== 'INR' && (
                <span className="text-sm text-gray-500 mt-2">
                  (₹{(expense.inrEquivalentCents / 100).toFixed(2)} at {expense.fxRate}x)
                </span>
              )}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-800 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Added by</span>
                <span className="font-medium text-white">{expense.paidBy.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-white">
                  {new Date(expense.expenseDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Split Type</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs font-semibold text-gray-300 tracking-wider">
                  {expense.splits[0]?.splitType || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">How it was split</h2>
            <div className="space-y-4">
              {expense.splits.map(split => {
                const isPayer = split.userId === expense.paidById
                return (
                  <div key={split.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="font-medium text-gray-300">{split.user.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-white">
                        {split.user.name} {isPayer && <span className="text-xs text-emerald-500 ml-1">(Payer)</span>}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-300">₹{(split.amountOwedCents / 100).toFixed(2)}</span>
                      {split.splitValue && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          ({split.splitValue}{split.splitType === 'PERCENTAGE' ? '%' : ' shares'})
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Chat */}
        <div>
          <ExpenseChat expenseId={expenseId} groupId={groupId} currentUserId={user.userId} />
        </div>
      </div>
    </div>
  )
}
