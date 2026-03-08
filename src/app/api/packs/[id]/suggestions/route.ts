import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, getCurrentUserId } from '@/lib/auth-utils'
import { notify } from '@/lib/notifications'

// GET /api/packs/:id/suggestions — list suggestions for a pack
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: packId } = await params

  const pack = await prisma.researchPack.findUnique({ where: { id: packId } })
  if (!pack) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
  }

  // Check if current user is the pack owner (to show all statuses)
  const currentUserId = await getCurrentUserId()
  const isOwner = currentUserId === pack.creatorId

  const suggestions = await prisma.suggestion.findMany({
    where: {
      packId,
      // Non-owners only see their own suggestions + accepted ones
      ...(isOwner
        ? {}
        : {
            OR: [
              { status: 'ACCEPTED' },
              ...(currentUserId ? [{ suggesterId: currentUserId }] : []),
            ],
          }),
    },
    include: {
      suggester: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(suggestions)
}

// POST /api/packs/:id/suggestions — suggest a source for a pack
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { id: packId } = await params

  const pack = await prisma.researchPack.findUnique({ where: { id: packId } })
  if (!pack) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
  }

  // Can't suggest to your own pack
  if (pack.creatorId === userId) {
    return NextResponse.json({ error: 'Cannot suggest sources to your own pack' }, { status: 403 })
  }

  const body = await req.json()
  const { url, title, type, notes } = body

  if (!url || !title || !type) {
    return NextResponse.json(
      { error: 'url, title, and type are required' },
      { status: 400 }
    )
  }

  // Check for duplicate
  const existing = await prisma.suggestion.findUnique({
    where: {
      suggesterId_packId_url: {
        suggesterId: userId,
        packId,
        url,
      },
    },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'You already suggested this URL for this pack' },
      { status: 409 }
    )
  }

  const suggestion = await prisma.suggestion.create({
    data: {
      url,
      title,
      type,
      notes: notes || null,
      suggesterId: userId,
      packId,
    },
    include: {
      suggester: {
        select: { id: true, name: true, image: true },
      },
    },
  })

  // Notify the pack owner about the new suggestion
  await notify({
    userId: pack.creatorId,
    actorId: userId,
    type: 'SUGGESTION_RECEIVED',
    message: `suggested a source for "${pack.title}"`,
    link: `/packs/${packId}`,
  })

  return NextResponse.json(suggestion, { status: 201 })
}
