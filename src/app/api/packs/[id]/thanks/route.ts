import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/packs/[id]/thanks - Toggle thanks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

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
      return NextResponse.json({ thanked: true })
    }
  } catch (error) {
    console.error('Error toggling thanks:', error)
    return NextResponse.json({ error: 'Failed to toggle thanks' }, { status: 500 })
  }
}
