'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Video, BookOpen, Headphones, Newspaper, Star, ExternalLink, Play, ChevronDown, ChevronUp } from 'lucide-react'
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

const typeGradients: Record<string, string> = {
  article: 'from-blue-500/5 to-transparent',
  video: 'from-red-500/5 to-transparent',
  paper: 'from-emerald-500/5 to-transparent',
  book: 'from-purple-500/5 to-transparent',
  podcast: 'from-orange-500/5 to-transparent',
}

export function SourceItem({ source, showInlineVideo = true }: SourceItemProps) {
  const [expanded, setExpanded] = useState(false)
  const hasVideo = source.type === 'video' && isVideoUrl(source.url)
  const showVideoPlayer = hasVideo && showInlineVideo

  if (showVideoPlayer) {
    return (
      <div className="space-y-3">
        <VideoPlayer url={source.url} title={source.title} notes={source.notes} />
        {source.relevanceRating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < source.relevanceRating!
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">Relevance rating</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={`group overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50 gradient-border ${typeGradients[source.type] || ''}`}>
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-4">
          {/* Type icon */}
          <div className={`shrink-0 p-2.5 rounded-xl border ${typeColors[source.type] || 'bg-muted text-muted-foreground border-border'}`}>
            {typeIcons[source.type] || <FileText className="h-4 w-4" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary transition-colors inline-flex items-center gap-1.5 group/link"
                >
                  <span className="line-clamp-1">{source.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                </a>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {(() => { try { return new URL(source.url).hostname.replace('www.', '') } catch { return source.url } })()}
                </p>
              </div>
              <Badge variant="outline" className="text-xs capitalize shrink-0 border-border/50">
                {source.type}
              </Badge>
            </div>

            {/* Notes preview */}
            {source.notes && (
              <div className="mt-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-muted-foreground text-left w-full"
                >
                  <span className={expanded ? '' : 'line-clamp-2'}>{source.notes}</span>
                  {source.notes.length > 100 && (
                    <span className="inline-flex items-center gap-0.5 text-primary hover:underline ml-1">
                      {expanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show more
                        </>
                      )}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Rating */}
            {source.relevanceRating && (
              <div className="flex items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 transition-colors ${
                      i < source.relevanceRating!
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1.5">
                  Relevance
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Video play button for video links */}
        {hasVideo && !showInlineVideo && (
          <div className="px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
              asChild
            >
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                <Play className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                Watch Video
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
