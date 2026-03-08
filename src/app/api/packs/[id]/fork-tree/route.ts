import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/packs/[id]/fork-tree - Get the complete fork tree for a pack
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the pack
    const pack = await prisma.researchPack.findUnique({
      where: { id },
      select: { id: true, forkedFromId: true },
    })

    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    // Walk up to find the root
    let rootId = pack.id
    let current = pack
    const visited = new Set<string>([rootId])

    while (current.forkedFromId) {
      if (visited.has(current.forkedFromId)) break // prevent cycles
      const parent = await prisma.researchPack.findUnique({
        where: { id: current.forkedFromId },
        select: { id: true, forkedFromId: true },
      })
      if (!parent) break
      rootId = parent.id
      visited.add(rootId)
      current = parent
    }

    // Now fetch the full tree from the root using recursive query
    // SQLite doesn't support recursive CTEs well through Prisma, so we do BFS
    const tree = await buildTree(rootId, id)

    return NextResponse.json(tree)
  } catch (error) {
    console.error('Error fetching fork tree:', error)
    return NextResponse.json({ error: 'Failed to fetch fork tree' }, { status: 500 })
  }
}

interface TreeNode {
  id: string
  title: string
  creator: { id: string; name: string; image: string | null }
  thanksCount: number
  forkCount: number
  sourceCount: number
  createdAt: string
  isCurrent: boolean
  children: TreeNode[]
}

async function buildTree(rootId: string, currentPackId: string): Promise<TreeNode | null> {
  const pack = await prisma.researchPack.findUnique({
    where: { id: rootId },
    select: {
      id: true,
      title: true,
      thanksCount: true,
      forkCount: true,
      createdAt: true,
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { sources: true } },
      forks: {
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!pack) return null

  const node: TreeNode = {
    id: pack.id,
    title: pack.title,
    creator: { id: pack.creator.id, name: pack.creator.name || 'Unknown', image: pack.creator.image },
    thanksCount: pack.thanksCount,
    forkCount: pack.forkCount,
    sourceCount: pack._count.sources,
    createdAt: pack.createdAt.toISOString(),
    isCurrent: pack.id === currentPackId,
    children: [],
  }

  // Recursively build children (limit depth to prevent abuse)
  for (const fork of pack.forks.slice(0, 20)) {
    const child = await buildTree(fork.id, currentPackId)
    if (child) node.children.push(child)
  }

  return node
}
