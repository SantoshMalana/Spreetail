'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteExpenseButton({ groupId, expenseId }: { groupId: string, expenseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone and will recalculate all group balances.')) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }

      router.push(`/dashboard/groups/${groupId}`)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete Expense'}
    </button>
  )
}
