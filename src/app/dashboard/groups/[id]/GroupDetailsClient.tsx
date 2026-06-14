'use client'

import { useState } from 'react'
import { InviteMemberModal } from './InviteMemberModal'
import { AddExpenseModal } from './AddExpenseModal'
import { SettleUpModal } from './SettleUpModal'
import { EditGroupModal } from './EditGroupModal'
import { LeaveGroupButton } from './LeaveGroupButton'
import { DeleteGroupButton } from './DeleteGroupButton'
import Link from 'next/link'

interface GroupMember {
  id: string
  userId: string
  joinedAt: string
  leftAt: string | null
  user: { id: string; name: string; email: string }
}

interface ExpenseSplit {
  id: string
  userId: string
  amountOwedCents: number
}

interface Expense {
  id: string
  description: string
  amountCents: number
  currency: string
  expenseDate: string
  paidBy: { name: string }
  category: string
  splits: ExpenseSplit[]
}

interface SimplifiedDebt {
  fromUserId: string
  toUserId: string
  amountCents: number
}

interface Group {
  id: string
  name: string
  members: GroupMember[]
  expenses: Expense[]
}

export function GroupDetailsClient({ 
  group, 
  currentUserId,
  simplifiedDebts
}: { 
  group: Group, 
  currentUserId: string,
  simplifiedDebts: SimplifiedDebt[]
}) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)
  const [isSettleOpen, setIsSettleOpen] = useState(false)
  const [isEditNameOpen, setIsEditNameOpen] = useState(false)

  const activeMembers = group.members.filter(m => !m.leftAt)
  const pastMembers = group.members.filter(m => m.leftAt)

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">{group.name}</h1>
            <button 
              onClick={() => setIsEditNameOpen(true)}
              className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
              title="Edit Group Name"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400">Manage expenses and members</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/groups/${group.id}/export`}
            download
            className="hidden md:flex px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-colors border border-gray-700"
          >
            📥 Export CSV
          </a>
          <button 
            onClick={() => setIsExpenseOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            + Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Recent Expenses</h2>
            
            {group.expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-800/20 rounded-xl border border-dashed border-gray-700/50">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-1">No expenses yet</h3>
                <p className="text-sm text-gray-500 max-w-[250px]">Add your first expense to start tracking shared costs with the group.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {group.expenses.map(expense => {
                  const mySplit = expense.splits.find(s => s.userId === currentUserId)
                  const iPaid = expense.paidBy.name === activeMembers.find(m => m.userId === currentUserId)?.user.name
                  
                  return (
                    <Link 
                      key={expense.id} 
                      href={`/dashboard/groups/${group.id}/expenses/${expense.id}`}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-800/50 hover:bg-gray-800 hover:border-gray-700 transition-colors block"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center shrink-0">
                          <span className="text-lg">{expense.category || '🧾'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{expense.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' • '}Paid by {expense.paidBy.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {expense.currency === 'USD' ? '$' : '₹'}
                          {(expense.amountCents / 100).toFixed(2)}
                        </p>
                        {mySplit ? (
                          <p className={`text-xs mt-0.5 ${iPaid ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {iPaid ? `You lent ₹${(expense.splits.filter(s => s.userId !== currentUserId).reduce((a,b)=>a+b.amountOwedCents,0) / 100).toFixed(2)}` : `You borrowed ₹${(mySplit.amountOwedCents / 100).toFixed(2)}`}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-0.5">Not involved</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Balances Widget */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Group Balances</h2>
            
            {simplifiedDebts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">All settled up!</p>
            ) : (
              <div className="space-y-4">
                {simplifiedDebts.map((debt, idx) => {
                  const fromUser = group.members.find(m => m.userId === debt.fromUserId)?.user.name || 'Someone'
                  const toUser = group.members.find(m => m.userId === debt.toUserId)?.user.name || 'someone'
                  const isMeOwe = debt.fromUserId === currentUserId
                  const isOwedMe = debt.toUserId === currentUserId
                  
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isMeOwe ? 'text-white' : 'text-gray-300'}`}>
                          {isMeOwe ? 'You' : fromUser}
                        </span>
                        <span className="text-gray-500">owes</span>
                        <span className={`font-medium ${isOwedMe ? 'text-white' : 'text-gray-300'}`}>
                          {isOwedMe ? 'you' : toUser}
                        </span>
                      </div>
                      <span className={`font-bold ${isMeOwe ? 'text-orange-400' : isOwedMe ? 'text-emerald-400' : 'text-gray-400'}`}>
                        ₹{(debt.amountCents / 100).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            
            {simplifiedDebts.length > 0 && (
              <button 
                onClick={() => setIsSettleOpen(true)}
                className="w-full mt-6 py-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded-xl transition-colors text-sm"
              >
                Settle up
              </button>
            )}
          </div>

          {/* Members Widget */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Members</h2>
              <button 
                onClick={() => setIsInviteOpen(true)}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                + Invite
              </button>
            </div>

            <div className="space-y-4">
              {activeMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-gray-300">{member.user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{member.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {pastMembers.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Past Members</h3>
                <div className="space-y-4">
                  {pastMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-gray-500">{member.user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-400 truncate">{member.user.name}</p>
                        <p className="text-xs text-gray-600 truncate">Left {new Date(member.leftAt!).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
              <LeaveGroupButton groupId={group.id} currentUserId={currentUserId} />
              {group.expenses.length === 0 && <DeleteGroupButton groupId={group.id} />}
            </div>
          </div>
        </div>
      </div>

      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} groupId={group.id} />
      <AddExpenseModal 
        isOpen={isExpenseOpen} 
        onClose={() => setIsExpenseOpen(false)} 
        groupId={group.id}
        members={group.members}
        currentUserId={currentUserId}
      />
      <SettleUpModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        groupId={group.id}
        currentUserId={currentUserId}
        debts={simplifiedDebts}
        members={group.members}
      />
      <EditGroupModal
        isOpen={isEditNameOpen}
        onClose={() => setIsEditNameOpen(false)}
        groupId={group.id}
        currentName={group.name}
      />
    </div>
  )
}
