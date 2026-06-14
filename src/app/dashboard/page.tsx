import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GroupListClient } from './GroupListClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId: user.userId, leftAt: null }
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { members: { where: { leftAt: null } }, expenses: true }
      }
    }
  })

  return <GroupListClient groups={groups} />
}
