'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  userId: string
  joinedAt: string
  leftAt: string | null
  user: { id: string; name: string }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  groupId: string
  members: Member[]
  currentUserId: string
}

type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARE'

export function AddExpenseModal({ isOpen, onClose, groupId, members, currentUserId }: Props) {
  const router = useRouter()
  
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [category, setCategory] = useState('🧾')
  const [fxRate, setFxRate] = useState('83.0')
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0])
  const [paidById, setPaidById] = useState(currentUserId)
  const [splitType, setSplitType] = useState<SplitType>('EQUAL')
  
  // Which users are included in this expense
  const [includedUserIds, setIncludedUserIds] = useState<Set<string>>(new Set(members.map(m => m.userId)))
  
  // Custom values for EXACT, PERCENTAGE, SHARE
  const [splitValues, setSplitValues] = useState<Record<string, string>>({})
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter members who were active on the selected expenseDate
  const activeMembersOnDate = useMemo(() => {
    return members.filter(m => {
      const joinedDateStr = m.joinedAt.split('T')[0]
      const leftDateStr = m.leftAt ? m.leftAt.split('T')[0] : '9999-12-31'
      return joinedDateStr <= expenseDate && leftDateStr >= expenseDate
    })
  }, [expenseDate, members])

  // Auto-remove users who weren't active on that date from the included set
  // Derived during render instead of useEffect to prevent cascading renders
  const activeIds = useMemo(() => new Set(activeMembersOnDate.map(m => m.userId)), [activeMembersOnDate])
  const actualIncludedUserIds = useMemo(() => {
    const next = new Set(includedUserIds)
    for (const id of next) {
      if (!activeIds.has(id)) next.delete(id)
    }
    return next
  }, [includedUserIds, activeIds])

  const parsedAmount = parseFloat(amount) || 0
  const parsedFxRate = currency === 'USD' ? parseFloat(fxRate) || 1 : 1
  const inrEquivalent = Math.round(parsedAmount * parsedFxRate * 100) // in cents

  // Calculate the live split preview
  const calculatedSplits = useMemo(() => {
    const included = Array.from(actualIncludedUserIds)
    if (included.length === 0 || inrEquivalent === 0) return {}

    const result: Record<string, number> = {}
    
    if (splitType === 'EQUAL') {
      const baseShare = Math.floor(inrEquivalent / included.length)
      let remainder = inrEquivalent % included.length
      
      // Sort alphabetically to deterministically assign the remainder cents
      const sortedUsers = [...included].sort()
      
      for (const uid of sortedUsers) {
        result[uid] = baseShare + (remainder > 0 ? 1 : 0)
        if (remainder > 0) remainder--
      }
    } 
    else if (splitType === 'EXACT') {
      for (const uid of included) {
        result[uid] = Math.round((parseFloat(splitValues[uid]) || 0) * 100)
      }
    }
    else if (splitType === 'PERCENTAGE') {
      for (const uid of included) {
        const pct = parseFloat(splitValues[uid]) || 0
        result[uid] = Math.round(inrEquivalent * (pct / 100))
      }
    }
    else if (splitType === 'SHARE') {
      let totalShares = 0
      for (const uid of included) totalShares += (parseFloat(splitValues[uid]) || 0)
      
      if (totalShares > 0) {
        const shareAmount = inrEquivalent / totalShares
        let sum = 0
        const sortedUsers = [...included].sort()
        
        for (let i = 0; i < sortedUsers.length; i++) {
          const uid = sortedUsers[i]
          if (i === sortedUsers.length - 1) {
            result[uid] = inrEquivalent - sum
          } else {
            const val = Math.round((parseFloat(splitValues[uid]) || 0) * shareAmount)
            result[uid] = val
            sum += val
          }
        }
      }
    }
    return result
  }, [inrEquivalent, actualIncludedUserIds, splitType, splitValues])

  // Early return AFTER all hooks to satisfy Rules of Hooks
  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const included = Array.from(actualIncludedUserIds)
    if (included.length === 0) {
      setError('You must include at least one person in the split.')
      setLoading(false)
      return
    }

    const payloadSplits = included.map(userId => ({
      userId,
      amountOwedCents: calculatedSplits[userId] || 0,
      splitType,
      splitValue: splitType !== 'EQUAL' ? (parseFloat(splitValues[userId]) || 0) : null
    }))

    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amountCents: Math.round(parsedAmount * 100),
          currency,
          fxRate: parsedFxRate,
          expenseDate,
          paidById,
          category,
          splits: payloadSplits
        }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add expense')

      onClose()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  function toggleUser(userId: string) {
    setIncludedUserIds(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const totalCalculated = Object.values(calculatedSplits).reduce((a, b) => a + b, 0)
  const isOffBalance = (splitType === 'EXACT' || splitType === 'PERCENTAGE') && totalCalculated !== inrEquivalent

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Add an Expense</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description & Category</label>
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-16 px-2 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                  >
                    <option value="🧾">🧾</option>
                    <option value="🍔">🍔</option>
                    <option value="✈️">✈️</option>
                    <option value="🏠">🏠</option>
                    <option value="🛒">🛒</option>
                    <option value="🚗">🚗</option>
                    <option value="🎟️">🎟️</option>
                    <option value="💡">💡</option>
                  </select>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dinner at Marina Bites"
                    required
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            {currency === 'USD' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <label className="block text-sm font-medium text-emerald-400 mb-1.5">Exchange Rate (USD to INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fxRate}
                  onChange={(e) => setFxRate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-emerald-500/70 mt-2">Calculated: ₹{(parsedAmount * parsedFxRate).toFixed(2)}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Paid by</label>
                <select
                  value={paidById}
                  onChange={(e) => setPaidById(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  {activeMembersOnDate.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">Split details</label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as SplitType)}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
                >
                  <option value="EQUAL">Split Equally</option>
                  <option value="EXACT">Exact Amounts</option>
                  <option value="PERCENTAGE">Percentages</option>
                  <option value="SHARE">Shares</option>
                </select>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {activeMembersOnDate.map(m => (
                  <div key={m.userId} className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={actualIncludedUserIds.has(m.userId)}
                        onChange={() => toggleUser(m.userId)}
                        className="w-5 h-5 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-800"
                      />
                      <span className="text-sm font-medium text-gray-200">{m.user.name}</span>
                    </label>

                    {includedUserIds.has(m.userId) && (
                      <div className="flex items-center gap-2">
                        {splitType !== 'EQUAL' && (
                          <input
                            type="number"
                            step="0.01"
                            value={splitValues[m.userId] || ''}
                            onChange={(e) => setSplitValues(prev => ({...prev, [m.userId]: e.target.value}))}
                            placeholder={splitType === 'PERCENTAGE' ? '%' : splitType === 'SHARE' ? 'shares' : '₹'}
                            className="w-20 px-2 py-1 text-right bg-gray-800 border border-gray-700 rounded text-sm text-white focus:border-emerald-500"
                          />
                        )}
                        <span className="text-sm text-gray-500 w-16 text-right">
                          ₹{((calculatedSplits[m.userId] || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isOffBalance && (
                <p className="text-xs text-red-400 mt-3 text-right">
                  Total splits (₹{(totalCalculated / 100).toFixed(2)}) do not match expense amount (₹{(inrEquivalent / 100).toFixed(2)})
                </p>
              )}
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
                disabled={loading || isOffBalance}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                {loading ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
