'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/Toaster'

export function DeleteGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to completely delete this group? This action cannot be undone.')) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete group')
      }

      toast('Group deleted successfully')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast(err.message, 'error')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="w-full mt-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-xl transition-colors border border-red-500/20 disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete Group'}
    </button>
  )
}
