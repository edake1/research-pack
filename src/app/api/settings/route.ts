import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

// GET /api/settings - Get current user's settings
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error
    const userId = authResult.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        publicProfile: true,
        publicEmail: true,
        notifyThanks: true,
        notifyForks: true,
        notifyComments: true,
        notifySuggestions: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        _count: {
          select: {
            packs: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/settings - Update current user's settings
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error
    const userId = authResult.userId

    const body = await request.json()

    // Whitelist allowed fields
    const allowedFields = [
      'name', 'bio', 'website',
      'publicProfile', 'publicEmail',
      'notifyThanks', 'notifyForks', 'notifyComments', 'notifySuggestions',
    ]

    const data: Record<string, any> = {}
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field]
      }
    }

    // Validate
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
      }
      if (data.name.length > 50) {
        return NextResponse.json({ error: 'Name must be under 50 characters' }, { status: 400 })
      }
      data.name = data.name.trim()
    }

    if (data.bio !== undefined) {
      if (typeof data.bio !== 'string') {
        return NextResponse.json({ error: 'Bio must be a string' }, { status: 400 })
      }
      if (data.bio.length > 300) {
        return NextResponse.json({ error: 'Bio must be under 300 characters' }, { status: 400 })
      }
      data.bio = data.bio.trim() || null
    }

    if (data.website !== undefined) {
      if (data.website && typeof data.website === 'string') {
        const trimmed = data.website.trim()
        if (trimmed) {
          try {
            new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
          } catch {
            return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 })
          }
          data.website = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
        } else {
          data.website = null
        }
      } else {
        data.website = null
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        bio: true,
        website: true,
        publicProfile: true,
        publicEmail: true,
        notifyThanks: true,
        notifyForks: true,
        notifyComments: true,
        notifySuggestions: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// DELETE /api/settings - Delete account
export async function DELETE() {
  try {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error
    const userId = authResult.userId

    // Delete user and all related data (cascading)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
