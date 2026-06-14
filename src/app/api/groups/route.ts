import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await request.json()
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    const group = await prisma.group.create({
      data: {
        name,
        members: {
          create: {
            userId: user.userId,
            joinedAt: new Date(),
          }
        }
      },
      include: {
        members: true
      }
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.userId,
            leftAt: null // Only active groups
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: { where: { leftAt: null } }, expenses: true }
        }
      }
    })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Get groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
