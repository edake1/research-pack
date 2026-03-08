import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/packs - List all packs with search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const topic = searchParams.get('topic')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = {
      ...(query && {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { topic: { contains: query } },
        ]
      }),
      ...(topic && { topic: { contains: topic } })
    }

    const [packs, total] = await Promise.all([
      prisma.researchPack.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: { sources: true, takeaways: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.researchPack.count({ where })
    ])

    return NextResponse.json({ packs, total })
  } catch (error) {
    console.error('Error fetching packs:', error)
    return NextResponse.json({ error: 'Failed to fetch packs' }, { status: 500 })
  }
}

// POST /api/packs - Create new pack
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, topic, tags, sources, takeaways, creatorId, forkedFromId } = body

    if (!title || !description || !topic || !creatorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: creatorId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const pack = await prisma.researchPack.create({
      data: {
        title,
        description,
        topic,
        tags: tags || '',
        creatorId,
        forkedFromId: forkedFromId || null,
        forkedById: forkedFromId ? creatorId : null,
        sources: {
          create: sources?.map((s: { url: string; title: string; type: string; notes?: string; relevanceRating?: number }) => ({
            url: s.url,
            title: s.title,
            type: s.type || 'article',
            notes: s.notes,
            relevanceRating: s.relevanceRating,
          })) || []
        },
        takeaways: {
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

    // If this is a fork, increment the original pack's fork count
    if (forkedFromId) {
      await prisma.researchPack.update({
        where: { id: forkedFromId },
        data: { forkCount: { increment: 1 } }
      })
    }

    return NextResponse.json(pack, { status: 201 })
  } catch (error) {
    console.error('Error creating pack:', error)
    return NextResponse.json({ error: 'Failed to create pack' }, { status: 500 })
  }
}
