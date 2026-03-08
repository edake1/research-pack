'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, X, ExternalLink, Maximize2 } from 'lucide-react'

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

  const youtubeId = getYouTubeId(url)
  const vimeoId = getVimeoId(url)

  const isVideo = youtubeId || vimeoId

  if (!isVideo) {
    return null
  }

  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : null

  if (isPlaying) {
    return (
      <Card className={`overflow-hidden bg-black ${isExpanded ? 'fixed inset-4 z-50 rounded-2xl' : ''}`}>
        <div className="relative">
          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {youtubeId && (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={`w-full ${isExpanded ? 'h-full' : 'aspect-video'}`}
            />
          )}
          {vimeoId && (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className={`w-full ${isExpanded ? 'h-full' : 'aspect-video'}`}
            />
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden group cursor-pointer card-hover" onClick={() => setIsPlaying(true)}>
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <Button
              size="lg"
              className="relative bg-violet-600 hover:bg-violet-700 rounded-full w-16 h-16 shadow-2xl shadow-violet-500/50 group-hover:scale-110 transition-transform"
            >
              <Play className="h-7 w-7 ml-1 fill-white" />
            </Button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-white font-medium line-clamp-2">{title}</h4>
          {notes && (
            <p className="text-white/70 text-sm mt-1 line-clamp-1">{notes}</p>
          )}
        </div>

        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            setIsPlaying(true)
            setIsExpanded(true)
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Platform badge */}
        <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 border-0">
          {youtubeId ? 'YouTube' : 'Vimeo'}
        </Badge>
      </div>
    </Card>
  )
}

export function isVideoUrl(url: string): boolean {
  return !!(getYouTubeId(url) || getVimeoId(url))
}
