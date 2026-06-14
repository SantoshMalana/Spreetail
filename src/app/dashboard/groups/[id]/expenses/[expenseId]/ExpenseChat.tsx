'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase-client'

interface Comment {
  id: string
  content: string
  createdAt: string
  userId: string
  user: { name: string }
}

export function ExpenseChat({ expenseId, groupId, currentUserId }: { expenseId: string, groupId: string, currentUserId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial comments
  useEffect(() => {
    fetch(`/api/groups/${groupId}/expenses/${expenseId}/comments`)
      .then(res => res.json())
      .then(data => {
        if (data.comments) {
          setComments(data.comments)
        }
        setLoading(false)
      })
  }, [expenseId, groupId])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  // Supabase Realtime subscription
  useEffect(() => {
    // We listen to inserts on ExpenseComment where expenseId matches
    const channel = supabase
      .channel(`expense_${expenseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ExpenseComment',
          filter: `expenseId=eq.${expenseId}`
        },
        async (payload) => {
          // Payload gives us raw row. We need the user's name though.
          // In a production app, we might join this via a view, but here we can just re-fetch the latest
          // or assume if it's our own message, it's already in state.
          const newRow = payload.new
          
          // Avoid duplicating if we just posted it ourselves
          setComments(prev => {
            if (prev.find(c => c.id === newRow.id)) return prev
            
            // Re-fetch to get user name (naive but robust for this size)
            fetch(`/api/groups/${groupId}/expenses/${expenseId}/comments`)
              .then(res => res.json())
              .then(data => {
                if (data.comments) setComments(data.comments)
              })
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [expenseId, groupId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMsg.trim()) return

    const tempId = `temp_${Date.now()}`
    const tempMsg: Comment = {
      id: tempId,
      content: newMsg,
      createdAt: new Date().toISOString(),
      userId: currentUserId,
      user: { name: 'You' }
    }

    setComments(prev => [...prev, tempMsg])
    setNewMsg('')

    try {
      const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tempMsg.content })
      })
      const data = await res.json()
      
      if (data.comment) {
        setComments(prev => prev.map(c => c.id === tempId ? data.comment : c))
      }
    } catch {
      console.error('Failed to send message')
      setComments(prev => prev.filter(c => c.id !== tempId))
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <h3 className="font-semibold text-white">Expense Chat</h3>
        <p className="text-xs text-gray-500">Live with Supabase Realtime</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500 text-center">Loading messages...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No messages yet. Start the conversation!</p>
        ) : (
          comments.map(c => {
            const isMe = c.userId === currentUserId
            return (
              <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400">{isMe ? 'You' : c.user.name}</span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                  isMe ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                }`}>
                  {c.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-900/80 border-t border-gray-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <button 
            type="submit"
            disabled={!newMsg.trim()}
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center shrink-0 transition-colors"
          >
            <svg className="w-4 h-4 text-white transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
