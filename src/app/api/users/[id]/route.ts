import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        packs: {
          where: { forkedById: null }, // Only original packs
          include: {
            _count: { select: { sources: true, thanks: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        forkedPacks: {
          include: {
            forkedFrom: {
              select: { id: true, title: true }
            },
            _count: { select: { sources: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { packs: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
