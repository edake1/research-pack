import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { notify } from '@/lib/notifications'

// PATCH /api/packs/:id/suggestions/:suggestionId — accept or reject a suggestion
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; suggestionId: string }> }
) {
  const { userId, error } = await requireAuth()
  if (error) return error

  const { id: packId, suggestionId } = await params

  // Verify pack ownership
  const pack = await prisma.researchPack.findUnique({ where: { id: packId } })
  if (!pack) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
  }
  if (pack.creatorId !== userId) {
    return NextResponse.json({ error: 'Only the pack owner can review suggestions' }, { status: 403 })
  }

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
  })
  if (!suggestion || suggestion.packId !== packId) {
    return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
  }
  if (suggestion.status !== 'PENDING') {
    return NextResponse.json({ error: 'Suggestion already reviewed' }, { status: 400 })
  }

  const body = await req.json()
  const { action } = body // 'accept' or 'reject'

  if (action !== 'accept' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "accept" or "reject"' }, { status: 400 })
  }

  if (action === 'accept') {
    // Accept: update suggestion status + add source to pack
    const [updatedSuggestion] = await prisma.$transaction([
      prisma.suggestion.update({
        where: { id: suggestionId },
        data: { status: 'ACCEPTED' },
        include: {
          suggester: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.source.create({
        data: {
          url: suggestion.url,
          title: suggestion.title,
          type: suggestion.type,
          notes: suggestion.notes ? `(Suggested) ${suggestion.notes}` : '(Suggested source)',
          packId,
        },
      }),
    ])

    // Notify the suggester that their suggestion was accepted
    await notify({
      userId: suggestion.suggesterId,
      actorId: userId,
      type: 'SUGGESTION_ACCEPTED',
      message: `accepted your source suggestion for "${pack.title}"`,
      link: `/packs/${packId}`,
    })

    return NextResponse.json(updatedSuggestion)
  } else {
    // Reject: just update status
    const updatedSuggestion = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: 'REJECTED' },
      include: {
        suggester: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(updatedSuggestion)
  }
}
