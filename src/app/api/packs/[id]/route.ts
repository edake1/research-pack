import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/packs/[id] - Get single pack
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pack = await prisma.researchPack.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, bio: true }
        },
        sources: {
          orderBy: { createdAt: 'asc' }
        },
        takeaways: {
          orderBy: { order: 'asc' }
        },
        forkedFrom: {
          include: {
            creator: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: { forks: true, thanks: true }
        }
      }
    })

    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.researchPack.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json(pack)
  } catch (error) {
    console.error('Error fetching pack:', error)
    return NextResponse.json({ error: 'Failed to fetch pack' }, { status: 500 })
  }
}

// PATCH /api/packs/[id] - Update pack
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, topic, tags, sources, takeaways, creatorId } = body

    const existingPack = await prisma.researchPack.findUnique({
      where: { id },
      select: { creatorId: true }
    })

    if (!existingPack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    if (existingPack.creatorId !== creatorId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const pack = await prisma.researchPack.update({
      where: { id },
      data: {
        title,
        description,
        topic,
        tags,
        sources: {
          deleteMany: {},
          create: sources?.map((s: { url: string; title: string; type: string; notes?: string; relevanceRating?: number }) => ({
            url: s.url,
            title: s.title,
            type: s.type || 'article',
            notes: s.notes,
            relevanceRating: s.relevanceRating,
          })) || []
        },
        takeaways: {
          deleteMany: {},
          create: takeaways?.map((t: { content: string }, index: number) => ({
            content: t.content,
            order: index,
          })) || []
        }
      },
      include: {
        creator: true,
        sources: true,
        takeaways: true,
      }
    })

    return NextResponse.json(pack)
  } catch (error) {
    console.error('Error updating pack:', error)
    return NextResponse.json({ error: 'Failed to update pack' }, { status: 500 })
  }
}

// DELETE /api/packs/[id] - Delete pack
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')

    const existingPack = await prisma.researchPack.findUnique({
      where: { id },
      select: { creatorId: true }
    })

    if (!existingPack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    if (existingPack.creatorId !== creatorId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await prisma.researchPack.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pack:', error)
    return NextResponse.json({ error: 'Failed to delete pack' }, { status: 500 })
  }
}
