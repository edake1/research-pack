'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Video, BookOpen, Headphones, Newspaper, Star, ExternalLink, Globe, StickyNote } from 'lucide-react'
import { VideoPlayer, isVideoUrl } from './VideoPlayer'

interface SourceItemProps {
  source: {
    id: string
    url: string
    title: string
    type: string
    notes: string | null
    relevanceRating: number | null
  }
  showInlineVideo?: boolean
}

const typeIcons: Record<string, React.ReactNode> = {
  article: <Newspaper className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  paper: <FileText className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
}

const typeColors: Record<string, string> = {
  article: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  video: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  paper: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  book: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  podcast: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
}

const typeBadgeColors: Record<string, string> = {
  article: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  video: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  paper: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  book: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  podcast: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
}

function getHostname(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function RelevanceStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/20'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1.5">{rating}/5</span>
    </div>
  )
}

export function SourceItem({ source, showInlineVideo = true }: SourceItemProps) {
  const [open, setOpen] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const hasVideo = source.type === 'video' && isVideoUrl(source.url)
  const showVideoPlayer = hasVideo && showInlineVideo

  // Video sources with inline player
  if (showVideoPlayer) {
    return (
      <div className="space-y-3">
        <VideoPlayer url={source.url} title={source.title} notes={source.notes} />
        {source.relevanceRating && <RelevanceStars rating={source.relevanceRating} />}
      </div>
    )
  }

  const hostname = getHostname(source.url)

  return (
    <>
      {/* Source card — clickable */}
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all p-4 flex items-start gap-3.5 group"
      >
        <div className={`shrink-0 p-2 rounded-lg border ${typeColors[source.type] || 'bg-muted text-muted-foreground border-border'}`}>
          {typeIcons[source.type] || <FileText className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1 group-hover:text-foreground transition-colors">
                {source.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {hostname}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] capitalize shrink-0 border-border/50">
              {source.type}
            </Badge>
          </div>
          {source.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{source.notes}</p>
          )}
          {source.relevanceRating && (
            <div className="mt-2">
              <RelevanceStars rating={source.relevanceRating} />
            </div>
          )}
        </div>
      </button>

      {/* Glassy Detail Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-border/30 bg-background/80 backdrop-blur-2xl shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">{source.title}</DialogTitle>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <Badge
              variant="outline"
              className={`capitalize text-xs px-2.5 py-0.5 ${typeBadgeColors[source.type] || 'border-border/50'}`}
            >
              {typeIcons[source.type] || <FileText className="h-3 w-3" />}
              <span className="ml-1.5">{source.type}</span>
            </Badge>
            {source.relevanceRating && <RelevanceStars rating={source.relevanceRating} />}
          </div>

          {/* Title + hostname */}
          <div className="px-6 pt-3 pb-4">
            <h2 className="text-lg font-semibold leading-snug">{source.title}</h2>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mt-1 group/link"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="group-hover/link:underline">{hostname}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Content area */}
          <div className="px-6 pb-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Creator's Notes */}
            {source.notes && (
              <div className="rounded-xl bg-muted/40 border border-border/30 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Creator&apos;s Notes
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{source.notes}</p>
              </div>
            )}

            {/* Video player in modal */}
            {hasVideo && (
              <div className="rounded-xl overflow-hidden border border-border/30">
                <VideoPlayer url={source.url} title={source.title} notes={null} />
              </div>
            )}

            {/* Preview iframe for non-video sources */}
            {!hasVideo && !iframeError && (
              <div className="rounded-xl border border-border/30 overflow-hidden">
                <iframe
                  src={source.url}
                  title={source.title}
                  className="w-full h-[350px] bg-white"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  loading="lazy"
                  onError={() => setIframeError(true)}
                />
              </div>
            )}

            {/* Fallback for blocked iframes */}
            {!hasVideo && iframeError && (
              <div className="rounded-xl border border-border/30 bg-muted/30 flex items-center justify-center h-[180px] text-center p-6">
                <div>
                  <Globe className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Preview not available</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">This site doesn&apos;t allow inline previews</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-border/30 bg-muted/20 flex items-center gap-3">
            <Button className="flex-1" asChild>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { isVideoUrl } from './VideoPlayer'
