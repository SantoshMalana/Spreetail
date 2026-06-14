'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
    >
      Sign out
    </button>
  )
}
