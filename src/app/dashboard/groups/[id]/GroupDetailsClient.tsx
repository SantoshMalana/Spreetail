'use client'

import { useState } from 'react'
import { InviteMemberModal } from './InviteMemberModal'

interface GroupMember {
  id: string
  joinedAt: string
  leftAt: string | null
  user: { id: string; name: string; email: string }
}

interface Group {
  id: string
  name: string
  members: GroupMember[]
}

export function GroupDetailsClient({ group }: { group: Group }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const activeMembers = group.members.filter(m => !m.leftAt)
  const pastMembers = group.members.filter(m => m.leftAt)

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{group.name}</h1>
          <p className="text-gray-400">Manage expenses and members</p>
        </div>
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
          + Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Expenses (Placeholder for now) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Expenses</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No expenses logged yet.</p>
            </div>
          </div>
        </div>

        {/* Sidebar: Members */}
        <div className="space-y-4">
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
          </div>
        </div>
      </div>

      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} groupId={group.id} />
    </div>
  )
}
