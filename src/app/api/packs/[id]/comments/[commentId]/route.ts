import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

// DELETE /api/packs/[id]/comments/[commentId] - Delete own comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { commentId } = await params

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  })

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  if (comment.userId !== auth.userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Delete replies first, then the comment
  await prisma.comment.deleteMany({ where: { parentId: commentId } })
  await prisma.comment.delete({ where: { id: commentId } })

  return NextResponse.json({ success: true })
}
