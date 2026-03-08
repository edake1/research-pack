'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SourceItem } from '@/components/SourceItem'
import {
  Eye,
  Heart,
  GitFork,
  Calendar,
  ArrowLeft,
  Loader2,
  Check,
  FileText,
  Zap,
  Sparkles,
  Bookmark,
  Link as LinkIcon,
  Pencil,
  Trash2
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Pack {
  id: string
  title: string
  description: string
  topic: string
  tags: string
  viewCount: number
  thanksCount: number
  forkCount: number
  createdAt: string
  creator: {
    id: string
    name: string
    image: string | null
    bio: string | null
  }
  sources: Array<{
    id: string
    url: string
    title: string
    type: string
    notes: string | null
    relevanceRating: number | null
  }>
  takeaways: Array<{
    id: string
    content: string
    order: number
  }>
  forkedFrom?: {
    id: string
    title: string
    creator: {
      id: string
      name: string
    }
  } | null
  _count?: {
    forks: number
    thanks: number
  }
}

export default function PackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const packId = params.id as string
  const [pack, setPack] = useState<Pack | null>(null)
  const [loading, setLoading] = useState(true)
  const [forking, setForking] = useState(false)
  const [thanking, setThanking] = useState(false)
  const [thanked, setThanked] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id ?? null
  const isOwner = currentUserId && pack?.creator?.id === currentUserId

  useEffect(() => {
    fetchPack()
  }, [packId])

  const fetchPack = async () => {
    try {
      const res = await fetch(`/api/packs/${packId}`)
      if (!res.ok) throw new Error('Pack not found')
      const data = await res.json()
      setPack(data)
    } catch (error) {
      console.error('Failed to fetch pack:', error)
      toast.error('Failed to load pack')
    } finally {
      setLoading(false)
    }
  }

  const handleFork = async () => {
    if (!pack) return
    if (!currentUserId) {
      toast.info('Sign in to fork packs')
      router.push('/auth/signin')
      return
    }
    setForking(true)
    try {
      const res = await fetch(`/api/packs/${pack.id}/fork`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to fork')
      const forkedPack = await res.json()
      toast.success('Pack forked successfully!')
      router.push(`/packs/${forkedPack.id}`)
    } catch (error) {
      toast.error('Failed to fork pack')
    } finally {
      setForking(false)
    }
  }

  const handleDelete = async () => {
    if (!pack) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/packs/${pack.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      toast.success('Pack deleted')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete pack')
    } finally {
      setDeleting(false)
    }
  }

  const handleThanks = async () => {
    if (!pack) return
    if (!currentUserId) {
      toast.info('Sign in to thank creators')
      router.push('/auth/signin')
      return
    }
    setThanking(true)
    try {
      const res = await fetch(`/api/packs/${pack.id}/thanks`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to thank')
      const data = await res.json()
      setThanked(data.thanked)
      toast.success(data.thanked ? 'Thanks sent! 💜' : 'Thanks removed')
      fetchPack()
    } catch (error) {
      toast.error('Failed to send thanks')
    } finally {
      setThanking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-violet-500/30 blur-xl animate-pulse" />
            <Loader2 className="relative h-10 w-10 animate-spin text-violet-600" />
          </div>
          <p className="text-muted-foreground">Loading research pack...</p>
        </div>
      </div>
    )
  }

  if (!pack) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-violet-500/10 mb-4">
          <FileText className="h-8 w-8 text-violet-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Pack not found</h2>
        <p className="text-muted-foreground mb-6">This research pack may have been deleted.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  const tags = pack.tags.split(',').map(t => t.trim()).filter(Boolean)
  const videoSources = pack.sources.filter(s => s.type === 'video')
  const otherSources = pack.sources.filter(s => s.type !== 'video')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white border-0">
                {pack.topic}
              </Badge>
              {pack.forkedFrom && (
                <Badge
                  variant="outline"
                  className="text-violet-600 dark:text-violet-400 border-violet-500/30"
                >
                  <GitFork className="h-3 w-3 mr-1" />
                  Forked from{' '}
                  <Link
                    href={`/packs/${pack.forkedFrom.id}`}
                    className="ml-1 hover:underline"
                  >
                    {pack.forkedFrom.title}
                  </Link>
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold leading-tight">{pack.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {pack.description}
            </p>
          </div>
        </div>

        {/* Stats & Creator */}
        <div className="flex flex-wrap items-center gap-6">
          <Link
            href={`/users/${pack.creator.id}`}
            className="flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-12 w-12 ring-2 ring-violet-500/20">
              <AvatarImage src={pack.creator.image || undefined} alt={pack.creator.name} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-medium">
                {pack.creator.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{pack.creator.name}</p>
              <p className="text-sm text-muted-foreground">Creator</p>
            </div>
          </Link>

          <Separator orientation="vertical" className="h-10 hidden sm:block" />

          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="font-medium text-foreground">{pack.viewCount}</span> views
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              <span className="font-medium text-foreground">{pack.thanksCount}</span> thanks
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="h-4 w-4" />
              <span className="font-medium text-foreground">{pack.forkCount}</span> forks
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(pack.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-3 py-1 border-border/50 hover:border-violet-500/30 transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleThanks}
            disabled={thanking}
            className={`btn-shine ${
              thanked
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
            }`}
          >
            {thanked ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Thanked
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                This Helped Me
              </>
            )}
          </Button>
          <Button
            onClick={handleFork}
            disabled={forking}
            variant="outline"
            className="border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
          >
            {forking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GitFork className="h-4 w-4 mr-2" />
            )}
            Fork This Pack
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => toast.info('Bookmarks coming soon!')}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copied to clipboard!')
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          {isOwner && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                className="border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
                onClick={() => router.push(`/packs/${pack.id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-600 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this pack?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{pack.title}&rdquo; and all its sources,
                      takeaways, and thanks. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
                      ) : (
                        'Delete Pack'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Video Sources (with embedded player) */}
      {videoSources.length > 0 && (
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10">
                <FileText className="h-4 w-4 text-red-500" />
              </div>
              Videos
              <Badge variant="secondary" className="ml-2">{videoSources.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoSources.map((source) => (
              <SourceItem key={source.id} source={source} showInlineVideo={true} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Other Sources */}
      {otherSources.length > 0 && (
        <Card className="border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <FileText className="h-4 w-4 text-violet-500" />
              </div>
              Sources
              <Badge variant="secondary" className="ml-2">{otherSources.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {otherSources.map((source) => (
              <SourceItem key={source.id} source={source} showInlineVideo={false} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Takeaways */}
      <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            Key Takeaways
            <Badge variant="secondary" className="ml-2">{pack.takeaways.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pack.takeaways.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No takeaways added yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {pack.takeaways.map((takeaway, index) => (
                <li
                  key={takeaway.id}
                  className="flex gap-4 items-start group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-medium shrink-0 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                    {index + 1}
                  </span>
                  <p className="text-base leading-relaxed pt-1">{takeaway.content}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* AI Improve Suggestion */}
      <Card className="border-dashed border-violet-500/30 bg-violet-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Sparkles className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="font-medium">Want to improve this pack?</p>
                <p className="text-sm text-muted-foreground">
                  Fork it and add your own sources and insights.
                </p>
              </div>
            </div>
            <Button
              onClick={handleFork}
              disabled={forking}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <GitFork className="h-4 w-4 mr-2" />
              Fork & Improve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
