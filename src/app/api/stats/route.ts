import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats - Get platform-wide statistics
export async function GET() {
  try {
    const [packCount, userCount, sourceCount] = await Promise.all([
      prisma.researchPack.count(),
      prisma.user.count(),
      prisma.source.count(),
    ])

    return NextResponse.json({
      packs: packCount,
      contributors: userCount,
      sources: sourceCount,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { packs: 0, contributors: 0, sources: 0 },
      { status: 500 }
    )
  }
}
