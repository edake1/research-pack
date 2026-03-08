import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/packs/:id/diff — compare this fork with its parent pack
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const pack = await prisma.researchPack.findUnique({
    where: { id },
    include: {
      sources: { orderBy: { createdAt: 'asc' } },
      takeaways: { orderBy: { order: 'asc' } },
    },
  })

  if (!pack) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
  }

  if (!pack.forkedFromId) {
    return NextResponse.json({ error: 'This pack is not a fork' }, { status: 400 })
  }

  const parent = await prisma.researchPack.findUnique({
    where: { id: pack.forkedFromId },
    include: {
      sources: { orderBy: { createdAt: 'asc' } },
      takeaways: { orderBy: { order: 'asc' } },
    },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Original pack no longer exists' }, { status: 404 })
  }

  // Compute diff
  const parentSourceUrls = new Set(parent.sources.map((s) => s.url))
  const forkSourceUrls = new Set(pack.sources.map((s) => s.url))
  const parentTakeawayContents = new Set(parent.takeaways.map((t) => t.content))
  const forkTakeawayContents = new Set(pack.takeaways.map((t) => t.content))

  const addedSources = pack.sources.filter((s) => !parentSourceUrls.has(s.url))
  const removedSources = parent.sources.filter((s) => !forkSourceUrls.has(s.url))
  const keptSources = pack.sources.filter((s) => parentSourceUrls.has(s.url))

  const addedTakeaways = pack.takeaways.filter(
    (t) => !parentTakeawayContents.has(t.content)
  )
  const removedTakeaways = parent.takeaways.filter(
    (t) => !forkTakeawayContents.has(t.content)
  )
  const keptTakeaways = pack.takeaways.filter((t) =>
    parentTakeawayContents.has(t.content)
  )

  const titleChanged = pack.title.replace(' (Fork)', '') !== parent.title
  const descriptionChanged = pack.description !== parent.description

  return NextResponse.json({
    parent: {
      id: parent.id,
      title: parent.title,
      description: parent.description,
    },
    fork: {
      id: pack.id,
      title: pack.title,
      description: pack.description,
    },
    sources: {
      added: addedSources.map((s) => ({ url: s.url, title: s.title, type: s.type })),
      removed: removedSources.map((s) => ({ url: s.url, title: s.title, type: s.type })),
      kept: keptSources.length,
    },
    takeaways: {
      added: addedTakeaways.map((t) => ({ content: t.content })),
      removed: removedTakeaways.map((t) => ({ content: t.content })),
      kept: keptTakeaways.length,
    },
    titleChanged,
    descriptionChanged,
    summary: {
      totalChanges:
        addedSources.length +
        removedSources.length +
        addedTakeaways.length +
        removedTakeaways.length +
        (titleChanged ? 1 : 0) +
        (descriptionChanged ? 1 : 0),
    },
  })
}
