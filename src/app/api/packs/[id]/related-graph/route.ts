import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/packs/[id]/related-graph
// Returns nodes (packs) and edges (shared tags/topics) for knowledge graph visualization
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Get the center pack
    const centerPack = await prisma.researchPack.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        topic: true,
        tags: true,
        thanksCount: true,
        forkCount: true,
        creator: { select: { id: true, name: true, image: true } },
      },
    })

    if (!centerPack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    const centerTags = centerPack.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    // Find packs that share tags or topic with this pack
    const relatedPacks = await prisma.researchPack.findMany({
      where: {
        id: { not: id },
        OR: [
          { topic: centerPack.topic },
          ...centerTags.map(tag => ({
            tags: { contains: tag },
          })),
        ],
      },
      select: {
        id: true,
        title: true,
        topic: true,
        tags: true,
        thanksCount: true,
        forkCount: true,
        creator: { select: { id: true, name: true, image: true } },
      },
      take: 15,
      orderBy: { thanksCount: 'desc' },
    })

    // Build nodes
    const nodes = [
      { id: centerPack.id, title: centerPack.title, topic: centerPack.topic, creator: centerPack.creator.name, isCurrent: true, weight: centerPack.thanksCount + centerPack.forkCount * 2 },
      ...relatedPacks.map(p => ({
        id: p.id,
        title: p.title,
        topic: p.topic,
        creator: p.creator.name,
        isCurrent: false,
        weight: p.thanksCount + p.forkCount * 2,
      })),
    ]

    // Build edges based on shared connections
    const edges: Array<{ source: string; target: string; strength: number; label: string }> = []

    for (const pack of relatedPacks) {
      const packTags = pack.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      const sharedTags = centerTags.filter(t => packTags.includes(t))
      const sameTopic = pack.topic.toLowerCase() === centerPack.topic.toLowerCase()

      const strength = sharedTags.length + (sameTopic ? 2 : 0)
      if (strength > 0) {
        const label = sameTopic
          ? sharedTags.length > 0
            ? `${pack.topic} + ${sharedTags.length} tag${sharedTags.length > 1 ? 's' : ''}`
            : pack.topic
          : `${sharedTags.join(', ')}`

        edges.push({
          source: centerPack.id,
          target: pack.id,
          strength,
          label,
        })
      }

      // Also find inter-related connections between secondary packs
      for (const other of relatedPacks) {
        if (pack.id >= other.id) continue // avoid duplicates
        const otherTags = other.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        const shared = packTags.filter(t => otherTags.includes(t))
        const sameT = pack.topic.toLowerCase() === other.topic.toLowerCase()
        const s = shared.length + (sameT ? 1 : 0)
        if (s >= 2) {
          edges.push({
            source: pack.id,
            target: other.id,
            strength: s,
            label: sameT ? pack.topic : shared.slice(0, 2).join(', '),
          })
        }
      }
    }

    return NextResponse.json({ nodes, edges })
  } catch (error) {
    console.error('Failed to build knowledge graph:', error)
    return NextResponse.json({ error: 'Failed to build graph' }, { status: 500 })
  }
}
