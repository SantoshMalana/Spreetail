'use client'

import { useState } from 'react'
import { CreateGroupModal } from './components/CreateGroupModal'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  _count: { members: number; expenses: number }
}

export function GroupListClient({ groups }: { groups: Group[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Your Groups</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="mb-2 text-white font-medium">No groups yet</p>
          <p className="text-sm">Create a group to start tracking expenses with your flatmates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-colors group flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-800 group-hover:bg-gray-700 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">{group.name}</h2>
              </div>
              <div className="mt-auto flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-800">
                <span>{group._count.members} members</span>
                <span>{group._count.expenses} expenses</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
