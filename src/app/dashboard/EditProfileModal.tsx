'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/Toaster'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentName: string
}

export function EditProfileModal({ isOpen, onClose, currentName }: Props) {
  const router = useRouter()
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.trim() === currentName) {
      onClose()
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      toast('Profile name updated successfully')
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                autoFocus
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
