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
      image: string | null
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

export function PackCard({ pack, featured = false }: PackCardProps) {
  const tags = pack.tags.split(',').map(t => t.trim()).filter(Boolean)

  return (
    <Link href={`/packs/${pack.id}`} className="block h-full">
      <Card className={`relative h-full overflow-hidden group cursor-pointer border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:shadow-md ${featured ? 'md:col-span-2' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium"
                >
                  {pack.topic}
                </Badge>
                {pack.forkedFrom && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground border-border/50"
                  >
                    <GitFork className="h-3 w-3 mr-1" />
                    Fork
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
              <h3 className="font-semibold leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                {pack.title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {pack.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal border-border/50"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs font-normal border-border/50 text-muted-foreground"
              >
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-border/30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={pack.creator.image || undefined} alt={pack.creator.name} />
                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                  {pack.creator.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{pack.creator.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {pack._count?.sources || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {pack.viewCount}
              </span>
              <span className="flex items-center gap-1">
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
