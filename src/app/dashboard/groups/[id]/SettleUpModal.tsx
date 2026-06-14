'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SimplifiedDebt {
  fromUserId: string
  toUserId: string
  amountCents: number
}

interface Member {
  userId: string
  user: { name: string }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  groupId: string
  currentUserId: string
  debts: SimplifiedDebt[]
  members: Member[]
}

export function SettleUpModal({ isOpen, onClose, groupId, currentUserId, debts, members }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter out debts that the current user is not involved in (optional, but usually settle up focuses on the user)
  // Actually, let's allow them to record any settlement they see
  const relevantDebts = debts.filter(d => d.fromUserId === currentUserId || d.toUserId === currentUserId)

  // Default to the first debt they owe
  const [selectedDebtIdx, setSelectedDebtIdx] = useState(0)

  if (!isOpen) return null

  const debtToSettle = relevantDebts[selectedDebtIdx] || debts[0]

  async function handleSettle() {
    if (!debtToSettle) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerId: debtToSettle.fromUserId,
          payeeId: debtToSettle.toUserId,
          amountCents: debtToSettle.amountCents
        }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to record settlement')

      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getUserName = (id: string) => members.find(m => m.userId === id)?.user.name || 'Someone'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2">Record a Payment</h2>
          <p className="text-sm text-gray-400 mb-6">Record a cash or UPI payment to settle balances.</p>

          {(relevantDebts.length === 0 && debts.length === 0) ? (
            <p className="text-emerald-400 mb-4 text-center">There are no outstanding debts to settle!</p>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select a balance to settle</label>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(relevantDebts.length > 0 ? relevantDebts : debts).map((debt, idx) => {
                  const isSelected = debtToSettle === debt
                  const isMeOwe = debt.fromUserId === currentUserId
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDebtIdx(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white' 
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {isMeOwe ? 'You' : getUserName(debt.fromUserId)} pay {debt.toUserId === currentUserId ? 'You' : getUserName(debt.toUserId)}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-400">
                        ₹{(debt.amountCents / 100).toFixed(2)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 mt-4">{error}</p>
          )}

          <div className="flex gap-3 pt-6 mt-4 border-t border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSettle}
              disabled={loading || debts.length === 0}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
