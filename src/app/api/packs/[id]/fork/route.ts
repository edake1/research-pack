import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

// POST /api/packs/[id]/fork - Fork a pack
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error
    const userId = authResult.userId

    const { id } = await params

    // Get original pack
    const originalPack = await prisma.researchPack.findUnique({
      where: { id },
      include: {
        sources: true,
        takeaways: true,
        creator: true,
      }
    })

    if (!originalPack) {
      return NextResponse.json({ error: 'Original pack not found' }, { status: 404 })
    }

    // Create forked pack
    const forkedPack = await prisma.researchPack.create({
      data: {
        title: `${originalPack.title} (Fork)`,
        description: originalPack.description,
        topic: originalPack.topic,
        tags: originalPack.tags,
        creatorId: userId,
        forkedFromId: id,
        forkedById: userId,
        sources: {
          create: originalPack.sources.map(s => ({
            url: s.url,
            title: s.title,
            type: s.type,
            notes: s.notes,
            relevanceRating: s.relevanceRating,
          }))
        },
        takeaways: {
          create: originalPack.takeaways.map(t => ({
            content: t.content,
            order: t.order,
          }))
        }
      },
      include: {
        creator: true,
        sources: true,
        takeaways: true,
        forkedFrom: {
          include: { creator: true }
        }
      }
    })

    // Increment original pack's fork count
    await prisma.researchPack.update({
      where: { id },
      data: { forkCount: { increment: 1 } }
    })

    return NextResponse.json(forkedPack, { status: 201 })
  } catch (error) {
    console.error('Error forking pack:', error)
    return NextResponse.json({ error: 'Failed to fork pack' }, { status: 500 })
  }
}
