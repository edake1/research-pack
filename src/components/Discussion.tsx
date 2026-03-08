'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Reply, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies: Comment[]
}

interface DiscussionProps {
  packId: string
}

export function Discussion({ packId }: DiscussionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [packId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/packs/${packId}/comments`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setComments(data)
    } catch {
      // Silently fail — discussion isn't critical
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!session) {
      toast.info('Sign in to join the discussion')
      router.push('/auth/signin')
      return
    }
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/packs/${packId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })
      if (!res.ok) throw new Error()
      setNewComment('')
      fetchComments()
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!session) {
      toast.info('Sign in to reply')
      router.push('/auth/signin')
      return
    }
    if (!replyContent.trim()) return

    setSubmittingReply(true)
    try {
      const res = await fetch(`/api/packs/${packId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      })
      if (!res.ok) throw new Error()
      setReplyContent('')
      setReplyingTo(null)
      fetchComments()
    } catch {
      toast.error('Failed to post reply')
    } finally {
      setSubmittingReply(false)
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Discussion
          {comments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0)})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New comment form */}
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0 mt-1">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
              {session?.user?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={session ? 'Add to the discussion...' : 'Sign in to comment...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none bg-muted/30 border-border/50 focus:border-border"
              disabled={!session}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Comment
              </Button>
            </div>
          </div>
        </div>

        {/* Comments list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Start the discussion!
          </p>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Top-level comment */}
                <div className="flex gap-3">
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarImage src={comment.user.image || undefined} />
                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                      {comment.user.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1.5 transition-colors"
                    >
                      <Reply className="h-3 w-3" />
                      Reply
                    </button>

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 flex gap-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px] resize-none text-sm bg-muted/30 border-border/50"
                          autoFocus
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleReply(comment.id)}
                            disabled={submittingReply || !replyContent.trim()}
                          >
                            {submittingReply ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Send'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-muted-foreground"
                            onClick={() => { setReplyingTo(null); setReplyContent('') }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-10 space-y-3 border-l border-border/30 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                          <AvatarImage src={reply.user.image || undefined} />
                          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                            {reply.user.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{reply.user.name}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
