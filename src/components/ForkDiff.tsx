'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GitCompareArrows,
  Plus,
  Minus,
  FileText,
  Zap,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface DiffData {
  parent: { id: string; title: string; description: string }
  fork: { id: string; title: string; description: string }
  sources: {
    added: { url: string; title: string; type: string }[]
    removed: { url: string; title: string; type: string }[]
    kept: number
  }
  takeaways: {
    added: { content: string }[]
    removed: { content: string }[]
    kept: number
  }
  titleChanged: boolean
  descriptionChanged: boolean
  summary: { totalChanges: number }
}

export function ForkDiff({ packId }: { packId: string }) {
  const [diff, setDiff] = useState<DiffData | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDiff = async () => {
    if (diff) {
      setExpanded(!expanded)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/packs/${packId}/diff`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load diff')
      }
      const data = await res.json()
      setDiff(data)
      setExpanded(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={fetchDiff}
        disabled={loading}
        className="border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <GitCompareArrows className="h-4 w-4 mr-2" />
        )}
        {expanded ? 'Hide' : 'View'} Changes
        {diff && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {diff.summary.totalChanges}
          </Badge>
        )}
        {expanded ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {expanded && diff && (
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4 text-violet-500" />
              Changes from{' '}
              <Link
                href={`/packs/${diff.parent.id}`}
                className="text-violet-500 hover:underline"
              >
                {diff.parent.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            {diff.summary.totalChanges === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No changes from the original yet.
              </p>
            ) : (
              <>
                {/* Title/Description changes */}
                {(diff.titleChanged || diff.descriptionChanged) && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Metadata
                    </p>
                    {diff.titleChanged && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20 text-xs">
                          Changed
                        </Badge>
                        <span className="text-muted-foreground">Title updated</span>
                      </div>
                    )}
                    {diff.descriptionChanged && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20 text-xs">
                          Changed
                        </Badge>
                        <span className="text-muted-foreground">Description updated</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Source changes */}
                {(diff.sources.added.length > 0 ||
                  diff.sources.removed.length > 0) && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      Sources
                      <span className="text-muted-foreground/60">
                        ({diff.sources.kept} unchanged)
                      </span>
                    </p>
                    {diff.sources.added.map((s, i) => (
                      <div
                        key={`add-${i}`}
                        className="flex items-center gap-2 text-sm p-2 rounded-md bg-green-500/5 border border-green-500/10"
                      >
                        <Plus className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-violet-500 transition-colors"
                        >
                          {s.title}
                          <ExternalLink className="inline h-3 w-3 ml-1 opacity-50" />
                        </a>
                        <Badge variant="outline" className="text-xs shrink-0 ml-auto">
                          {s.type}
                        </Badge>
                      </div>
                    ))}
                    {diff.sources.removed.map((s, i) => (
                      <div
                        key={`rem-${i}`}
                        className="flex items-center gap-2 text-sm p-2 rounded-md bg-red-500/5 border border-red-500/10"
                      >
                        <Minus className="h-3.5 w-3.5 text-red-600 shrink-0" />
                        <span className="truncate text-muted-foreground line-through">
                          {s.title}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0 ml-auto">
                          {s.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Takeaway changes */}
                {(diff.takeaways.added.length > 0 ||
                  diff.takeaways.removed.length > 0) && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-3 w-3" />
                      Takeaways
                      <span className="text-muted-foreground/60">
                        ({diff.takeaways.kept} unchanged)
                      </span>
                    </p>
                    {diff.takeaways.added.map((t, i) => (
                      <div
                        key={`add-${i}`}
                        className="flex items-start gap-2 text-sm p-2 rounded-md bg-green-500/5 border border-green-500/10"
                      >
                        <Plus className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                        <span>{t.content}</span>
                      </div>
                    ))}
                    {diff.takeaways.removed.map((t, i) => (
                      <div
                        key={`rem-${i}`}
                        className="flex items-start gap-2 text-sm p-2 rounded-md bg-red-500/5 border border-red-500/10"
                      >
                        <Minus className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground line-through">
                          {t.content}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
