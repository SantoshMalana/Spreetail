'use client'

import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

export const toast = (message: string, type: ToastType = 'success') => {
  const event = new CustomEvent('show-toast', { detail: { message, type } })
  window.dispatchEvent(event)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>
      const id = Math.random().toString(36).substr(2, 9)
      const newToast = { id, ...customEvent.detail }
      
      setToasts(prev => [...prev, newToast])

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }

    window.addEventListener('show-toast', handleToast)
    return () => window.removeEventListener('show-toast', handleToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-fade-in px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-2 pointer-events-auto transition-all
            ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
            ${t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
            ${t.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : ''}
          `}
        >
          {t.type === 'success' && <span>✓</span>}
          {t.type === 'error' && <span>⚠️</span>}
          {t.type === 'info' && <span>ℹ️</span>}
          <span className="font-medium text-sm">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
