import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats - Get platform-wide statistics
export async function GET() {
  try {
    const [packCount, userCount, sourceCount, topicsRaw] = await Promise.all([
      prisma.researchPack.count(),
      prisma.user.count(),
      prisma.source.count(),
      prisma.researchPack.groupBy({
        by: ['topic'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 12,
      }),
    ])

    const topics = topicsRaw.map((t) => ({
      name: t.topic,
      count: t._count.id,
    }))

    return NextResponse.json({
      packs: packCount,
      contributors: userCount,
      sources: sourceCount,
      topics,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { packs: 0, contributors: 0, sources: 0, topics: [] },
      { status: 500 }
    )
  }
}
