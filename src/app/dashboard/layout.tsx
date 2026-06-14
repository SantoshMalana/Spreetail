import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from './LogoutButton'
import { MobileNav } from './MobileNav'
import { ProfileButton } from './ProfileButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                </svg>
              </div>
              <span className="font-bold tracking-tight">Spreetail</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Groups</Link>
              <Link href="/dashboard/import" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Import CSV</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <MobileNav />
            <ProfileButton currentName={user.name} />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
