'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, X, ExternalLink, Maximize2, Video } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title: string
  notes?: string | null
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function VideoPlayer({ url, title, notes }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [thumbError, setThumbError] = useState(false)

  const youtubeId = getYouTubeId(url)
  const vimeoId = getVimeoId(url)
  const isVideo = youtubeId || vimeoId

  if (!isVideo) return null

  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : null

  // Expanded fullscreen overlay
  if (isPlaying && isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full"
          onClick={() => { setIsExpanded(false); setIsPlaying(false) }}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden">
          {youtubeId && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
          {vimeoId && (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    )
  }

  // Inline playing
  if (isPlaying) {
    return (
      <div className="rounded-xl overflow-hidden border border-border/50 bg-black">
        <div className="aspect-video">
          {youtubeId && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border/50">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{title}</p>
            {notes && <p className="text-xs text-muted-foreground truncate mt-0.5">{notes}</p>}
          </div>
          <div className="flex gap-1 ml-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => { setIsExpanded(true) }}
              title="Expand"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer" title="Open original">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Thumbnail / preview state
  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-200"
      onClick={() => setIsPlaying(true)}
    >
      <div className="relative aspect-video">
        {/* Thumbnail or fallback */}
        {thumbnailUrl && !thumbError ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 group-hover:from-black/80" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
            <Play className="h-6 w-6 ml-0.5 fill-current text-black dark:text-white" />
          </div>
        </div>

        {/* Platform badge */}
        <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm hover:bg-black/70 border-0 text-white text-[10px] px-2 py-0.5">
          {youtubeId ? 'YouTube' : 'Vimeo'}
        </Badge>

        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2.5 right-2.5 h-7 w-7 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            setIsPlaying(true)
            setIsExpanded(true)
          }}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-white font-medium text-sm line-clamp-2 leading-snug">{title}</h4>
          {notes && (
            <p className="text-white/60 text-xs mt-1 line-clamp-1">{notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function isVideoUrl(url: string): boolean {
  return !!(getYouTubeId(url) || getVimeoId(url))
}
