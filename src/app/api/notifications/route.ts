import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

// GET /api/notifications — list notifications for the current user
export async function GET(_req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const notifications = await prisma.notification.findMany({
    where: { userId },
    include: {
      actor: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const { ids } = body // array of notification IDs, or 'all'

  if (ids === 'all') {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  } else if (Array.isArray(ids) && ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId },
      data: { read: true },
    })
  } else {
    return NextResponse.json({ error: 'ids must be an array or "all"' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
