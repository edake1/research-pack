'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Lightbulb,
  Plus,
  Check,
  X,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface Suggestion {
  id: string
  url: string
  title: string
  type: string
  notes: string | null
  status: string
  createdAt: string
  suggester: {
    id: string
    name: string | null
    image: string | null
  }
}

interface SuggestionsProps {
  packId: string
  ownerId: string
}

const SOURCE_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'paper', label: 'Paper' },
  { value: 'book', label: 'Book' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'tool', label: 'Tool' },
  { value: 'other', label: 'Other' },
]

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const statusConfig: Record<
  string,
  { icon: typeof Clock; label: string; className: string }
> = {
  PENDING: {
    icon: Clock,
    label: 'Pending',
    className: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  },
  ACCEPTED: {
    icon: CheckCircle2,
    label: 'Accepted',
    className: 'text-green-600 bg-green-500/10 border-green-500/20',
  },
  REJECTED: {
    icon: XCircle,
    label: 'Declined',
    className: 'text-red-600 bg-red-500/10 border-red-500/20',
  },
}

export function Suggestions({ packId, ownerId }: SuggestionsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const currentUserId = (session?.user as any)?.id ?? null
  const isOwner = currentUserId === ownerId
  const isSignedIn = !!currentUserId

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  // Form state
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('article')
  const [notes, setNotes] = useState('')

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/packs/${packId}/suggestions`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSuggestions(data)
    } catch {
      // Silently fail — suggestions are supplementary
    } finally {
      setLoading(false)
    }
  }, [packId])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !title.trim()) {
      toast.error('URL and title are required')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/packs/${packId}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim(), type, notes: notes.trim() || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit suggestion')
      }

      toast.success('Suggestion submitted!')
      setUrl('')
      setTitle('')
      setType('article')
      setNotes('')
      setShowForm(false)
      fetchSuggestions()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit suggestion')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReview = async (suggestionId: string, action: 'accept' | 'reject') => {
    setReviewingId(suggestionId)
    try {
      const res = await fetch(`/api/packs/${packId}/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to review suggestion')
      }

      toast.success(action === 'accept' ? 'Source added to pack!' : 'Suggestion declined')
      fetchSuggestions()

      // If accepted, refresh the page to show the new source
      if (action === 'accept') {
        window.location.reload()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to review suggestion')
    } finally {
      setReviewingId(null)
    }
  }

  const pendingCount = suggestions.filter((s) => s.status === 'PENDING').length

  // Don't render at all if there are no suggestions and the user can't suggest
  if (!loading && suggestions.length === 0 && (isOwner || !isSignedIn)) {
    return null
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </div>
            Source Suggestions
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingCount} pending
              </Badge>
            )}
          </CardTitle>

          {isSignedIn && !isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Suggest Source
            </Button>
          )}
          {!isSignedIn && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10"
              onClick={() => {
                toast.info('Sign in to suggest sources')
                router.push('/auth/signin')
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Suggest Source
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Suggest form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Source URL *"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Input
                placeholder="Source title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Why is this source relevant? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={1}
                className="min-h-[40px] resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Lightbulb className="h-4 w-4 mr-1" />
                )}
                Submit Suggestion
              </Button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Suggestion list */}
        {!loading && suggestions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No suggestions yet. Be the first to suggest a source!
          </p>
        )}

        {!loading &&
          suggestions.map((suggestion) => {
            const status = statusConfig[suggestion.status] || statusConfig.PENDING
            const StatusIcon = status.icon

            return (
              <div
                key={suggestion.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card/50"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={suggestion.suggester.image || undefined}
                    alt={suggestion.suggester.name || 'User'}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {suggestion.suggester.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('') || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={suggestion.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm hover:text-violet-500 transition-colors truncate"
                    >
                      {suggestion.title}
                      <ExternalLink className="inline h-3 w-3 ml-1 opacity-50" />
                    </a>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {suggestion.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${status.className}`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  {suggestion.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.notes}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    by {suggestion.suggester.name || 'Anonymous'} · {timeAgo(suggestion.createdAt)}
                  </p>
                </div>

                {/* Owner review actions */}
                {isOwner && suggestion.status === 'PENDING' && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                      onClick={() => handleReview(suggestion.id, 'accept')}
                      disabled={reviewingId === suggestion.id}
                      title="Accept — adds this source to the pack"
                    >
                      {reviewingId === suggestion.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                      onClick={() => handleReview(suggestion.id, 'reject')}
                      disabled={reviewingId === suggestion.id}
                      title="Decline this suggestion"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
