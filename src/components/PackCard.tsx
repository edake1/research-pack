'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Heart, GitFork, FileText, TrendingUp } from 'lucide-react'

interface PackCardProps {
  pack: {
    id: string
    title: string
    description: string
    topic: string
    tags: string
    viewCount: number
    thanksCount: number
    forkCount: number
    creator: {
      id: string
      name: string
      avatar: string | null
    }
    _count?: {
      sources: number
    }
    forkedFrom?: {
      id: string
      title: string
    } | null
  }
  featured?: boolean
}

const topicColors: Record<string, string> = {
  'Artificial Intelligence': 'from-violet-500 to-purple-600',
  'Climate Science': 'from-emerald-500 to-green-600',
  'Space Exploration': 'from-blue-500 to-indigo-600',
  'Quantum Computing': 'from-purple-500 to-pink-600',
  'Finance & ML': 'from-amber-500 to-orange-600',
}

export function PackCard({ pack, featured = false }: PackCardProps) {
  const tags = pack.tags.split(',').map(t => t.trim()).filter(Boolean)
  const gradient = topicColors[pack.topic] || 'from-violet-500 to-indigo-600'

  return (
    <Link href={`/packs/${pack.id}`} className="block h-full">
      <Card className={`relative h-full overflow-hidden group cursor-pointer border-border/50 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 gradient-border ${featured ? 'md:col-span-2' : ''}`}>
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-[-1px] rounded-lg bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-20 blur-sm" />
        </div>

        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={`text-xs font-medium bg-gradient-to-r ${gradient} text-white border-0`}
                >
                  {pack.topic}
                </Badge>
                {pack.forkedFrom && (
                  <Badge
                    variant="outline"
                    className="text-xs text-violet-600 dark:text-violet-400 border-violet-500/30"
                  >
                    <GitFork className="h-3 w-3 mr-1" />
                    Forked
                  </Badge>
                )}
                {pack.thanksCount > 40 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200 line-clamp-2">
                {pack.title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {pack.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal border-border/50 hover:border-violet-500/30 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs font-normal border-border/50"
              >
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="relative pt-3 border-t border-border/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 ring-2 ring-background">
                <AvatarImage src={pack.creator.avatar || undefined} alt={pack.creator.name} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                  {pack.creator.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{pack.creator.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 transition-colors group-hover:text-violet-500">
                <FileText className="h-3.5 w-3.5" />
                {pack._count?.sources || 0}
              </span>
              <span className="flex items-center gap-1 transition-colors group-hover:text-violet-500">
                <Eye className="h-3.5 w-3.5" />
                {pack.viewCount}
              </span>
              <span className="flex items-center gap-1 transition-colors group-hover:text-amber-500">
                <Heart className="h-3.5 w-3.5" />
                {pack.thanksCount}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
