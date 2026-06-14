'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LeaveGroupButton({ groupId, currentUserId }: { groupId: string, currentUserId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this group? You can only leave if all your balances are settled.')) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${currentUserId}`, {
        method: 'DELETE',
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to leave group')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLeave}
      disabled={loading}
      className="w-full mt-6 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-xl transition-colors border border-red-500/20 disabled:opacity-50"
    >
      {loading ? 'Leaving...' : 'Leave Group'}
    </button>
  )
}
