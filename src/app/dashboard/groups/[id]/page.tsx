import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { GroupDetailsClient } from './GroupDetailsClient'

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id } = await params

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: 'asc' }
      }
    }
  })

  if (!group) {
    return <div className="text-white">Group not found</div>
  }

  // Security check: Only members can view
  const isMember = group.members.some(m => m.userId === user.userId)
  if (!isMember) {
    return <div className="text-white">You don't have permission to view this group.</div>
  }

  // Convert dates to string for client component props
  const serializedGroup = {
    ...group,
    members: group.members.map(m => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
      leftAt: m.leftAt?.toISOString() || null
    }))
  }

  return <GroupDetailsClient group={serializedGroup} />
}
