import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, getCurrentUserId } from '@/lib/auth-utils'
import { notify } from '@/lib/notifications'

// GET /api/packs/[id]/thanks - Check if current user thanked this pack
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ thanked: false })
    }
    const { id } = await params
    const existing = await prisma.thanks.findUnique({
      where: { userId_packId: { userId, packId: id } }
    })
    return NextResponse.json({ thanked: !!existing })
  } catch {
    return NextResponse.json({ thanked: false })
  }
}

// POST /api/packs/[id]/thanks - Toggle thanks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error
    const userId = authResult.userId

    const { id } = await params

    // Check if pack exists
    const pack = await prisma.researchPack.findUnique({ where: { id } })
    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    // Check if user already thanked
    const existingThanks = await prisma.thanks.findUnique({
      where: {
        userId_packId: { userId, packId: id }
      }
    })

    if (existingThanks) {
      // Remove thanks
      await prisma.thanks.delete({
        where: { id: existingThanks.id }
      })
      await prisma.researchPack.update({
        where: { id },
        data: { thanksCount: { decrement: 1 } }
      })
      return NextResponse.json({ thanked: false })
    } else {
      // Add thanks
      await prisma.thanks.create({
        data: { userId, packId: id }
      })
      await prisma.researchPack.update({
        where: { id },
        data: { thanksCount: { increment: 1 } }
      })

      // Notify the pack creator
      await notify({
        userId: pack.creatorId,
        actorId: userId,
        type: 'THANKS',
        message: `thanked you for "${pack.title}"`,
        link: `/packs/${id}`,
      })

      return NextResponse.json({ thanked: true })
    }
  } catch (error) {
    console.error('Error toggling thanks:', error)
    return NextResponse.json({ error: 'Failed to toggle thanks' }, { status: 500 })
  }
}
