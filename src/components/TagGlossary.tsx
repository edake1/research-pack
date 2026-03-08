'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Search, Sparkles, BookOpen, ArrowRight, Lightbulb, Link2 } from 'lucide-react'

interface KeywordInsight {
  definition: string
  significance: string
  relatedTerms: string[]
  funFact: string
}

// Cache insights in memory so we don't re-fetch the same keyword
const insightCache = new Map<string, KeywordInsight>()

interface TagGlossaryProps {
  tag: string
  context?: string  // e.g. the pack title or topic for better AI context
}

export function TagGlossary({ tag, context }: TagGlossaryProps) {
  const [open, setOpen] = useState(false)
  const [insight, setInsight] = useState<KeywordInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()

  const fetchInsight = useCallback(async () => {
    if (insightCache.has(tag.toLowerCase())) {
      setInsight(insightCache.get(tag.toLowerCase())!)
      return
    }

    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/keyword-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: tag, context }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      insightCache.set(tag.toLowerCase(), data)
      setInsight(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [tag, context])

  const handleOpen = () => {
    setOpen(true)
    if (!insight && !loading) {
      fetchInsight()
    }
  }

  const handleExplore = () => {
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(tag)}`)
  }

  return (
    <>
      <button onClick={handleOpen}>
        <Badge
          variant="outline"
          className="px-3 py-1 border-border/50 hover:bg-muted/50 hover:border-border cursor-pointer transition-all"
        >
          {tag}
        </Badge>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-border/30 bg-background/80 backdrop-blur-2xl shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">{tag} — Keyword Glossary</DialogTitle>

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Keyword</p>
                <h2 className="text-xl font-bold capitalize">{tag}</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-5 min-h-[200px]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="relative h-6 w-6 animate-spin text-violet-500" />
                </div>
                <p className="text-sm text-muted-foreground">Generating insights...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-10 space-y-3">
                <p className="text-sm text-muted-foreground">Couldn&apos;t generate insights right now.</p>
                <Button variant="outline" size="sm" onClick={fetchInsight}>
                  Try Again
                </Button>
              </div>
            )}

            {insight && !loading && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {/* Definition */}
                <div className="rounded-xl bg-muted/40 border border-border/30 p-4">
                  <p className="text-sm leading-relaxed">{insight.definition}</p>
                </div>

                {/* Significance */}
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Why it matters</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{insight.significance}</p>
                  </div>
                </div>

                {/* Fun fact */}
                {insight.funFact && (
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Did you know?</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{insight.funFact}</p>
                    </div>
                  </div>
                )}

                {/* Related terms */}
                {insight.relatedTerms?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Related</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.relatedTerms.map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setOpen(false)
                            router.push(`/search?q=${encodeURIComponent(term)}`)
                          }}
                        >
                          <Badge
                            variant="outline"
                            className="text-xs border-border/50 hover:bg-muted/50 hover:border-border cursor-pointer transition-colors"
                          >
                            {term}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/30 bg-muted/20">
            <Button className="w-full" onClick={handleExplore}>
              <Search className="h-4 w-4 mr-2" />
              Explore &ldquo;{tag}&rdquo; Packs
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
