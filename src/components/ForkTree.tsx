'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GitFork, Loader2, Heart, FileText, ChevronRight, Crown, Eye } from 'lucide-react'

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

function TreeNodeCard({ node, depth = 0, onNavigate }: { node: TreeNode; depth?: number; onNavigate: (id: string) => void }) {
  const [expanded, setExpanded] = useState(depth < 2) // auto-expand first 2 levels

  return (
    <div className="relative">
      {/* Connector line */}
      {depth > 0 && (
        <div className="absolute -left-5 top-0 w-5 h-5 border-l-2 border-b-2 border-border/40 rounded-bl-lg" />
      )}

      {/* Node */}
      <button
        onClick={() => onNavigate(node.id)}
        className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm ${
          node.isCurrent
            ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20'
            : 'border-border/50 hover:border-border hover:bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <Avatar className="h-7 w-7 mt-0.5 shrink-0">
            <AvatarImage src={node.creator.image || undefined} alt={node.creator.name} />
            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
              {node.creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-medium truncate ${node.isCurrent ? 'text-violet-600 dark:text-violet-400' : ''}`}>
                {node.title}
              </p>
              {depth === 0 && (
                <Crown className="h-3 w-3 text-amber-500 shrink-0" />
              )}
              {node.isCurrent && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                  Current
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{node.creator.name}</span>
              <span className="flex items-center gap-0.5">
                <FileText className="h-3 w-3" />
                {node.sourceCount}
              </span>
              <span className="flex items-center gap-0.5">
                <Heart className="h-3 w-3" />
                {node.thanksCount}
              </span>
              {node.forkCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <GitFork className="h-3 w-3" />
                  {node.forkCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="mt-1">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="ml-5 mt-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
              {node.children.length} fork{node.children.length !== 1 ? 's' : ''}
            </button>
          ) : (
            <div className="ml-5 pl-5 border-l-2 border-border/30 space-y-2 mt-2">
              {node.children.map((child) => (
                <TreeNodeCard key={child.id} node={child} depth={depth + 1} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function countNodes(node: TreeNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0)
}

export function ForkTree({ packId, forkCount, hasParent }: { packId: string; forkCount: number; hasParent?: boolean }) {
  const [open, setOpen] = useState(false)
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()

  const fetchTree = useCallback(async () => {
    if (tree) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/packs/${packId}/fork-tree`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setTree(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [packId, tree])

  const handleOpen = () => {
    setOpen(true)
    fetchTree()
  }

  const handleNavigate = (id: string) => {
    setOpen(false)
    router.push(`/packs/${id}`)
  }

  // Don't show if no forks and no parent
  if (forkCount === 0 && !hasParent) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="border-border/50 hover:border-border"
      >
        <GitFork className="h-3.5 w-3.5 mr-1.5" />
        Fork Tree
        <Badge variant="secondary" className="ml-2 text-xs">
          {forkCount}
        </Badge>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-border/30 bg-background/80 backdrop-blur-2xl shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">Fork Tree</DialogTitle>

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-muted border border-border/30">
                <GitFork className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">Fork Tree</h2>
                <p className="text-xs text-muted-foreground">
                  {tree ? `${countNodes(tree)} packs in this family` : 'Evolution of this research'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading fork tree...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-10 space-y-3">
                <p className="text-sm text-muted-foreground">Couldn&apos;t load the fork tree.</p>
                <Button variant="outline" size="sm" onClick={() => { setTree(null); fetchTree() }}>
                  Try Again
                </Button>
              </div>
            )}

            {tree && !loading && (
              <TreeNodeCard node={tree} onNavigate={handleNavigate} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
