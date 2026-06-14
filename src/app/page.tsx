import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { LandingClient } from './LandingClient'

export default async function HomePage() {
  const user = await getSessionUser()
  if (user) {
    redirect('/dashboard')
  }

  return <LandingClient />
}
