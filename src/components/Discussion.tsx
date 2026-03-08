'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Reply, Loader2, Send, Trash2, ChevronDown, ChevronUp, LogIn } from 'lucide-react'
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set())

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

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    setDeletingId(commentId)
    try {
      const res = await fetch(`/api/packs/${packId}/comments/${commentId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      fetchComments()
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleReplies = (commentId: string) => {
    setCollapsedReplies(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  const totalCount = comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0)

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

  const isOwn = (userId: string) => session?.user?.id === userId

  return (
    <div className="rounded-xl border border-border/50 bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Discussion</h3>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* New comment form */}
        {session ? (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0 mt-1">
              <AvatarImage src={session.user?.image || undefined} />
              <AvatarFallback className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400">
                {session.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add to the discussion..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none bg-muted/30 border-border/50 focus:border-violet-500/30 text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newComment.length > 0 && `${newComment.length} characters`}
                </span>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting || !newComment.trim()}
                  className="h-8"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Comment
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push('/auth/signin')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign in to join the discussion
          </button>
        )}

        {/* Comments list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Be the first to share your thoughts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="group/thread">
                {/* Top-level comment */}
                <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors -mx-1">
                  <Link href={`/users/${comment.user.id}`} className="shrink-0">
                    <Avatar className="h-7 w-7 mt-0.5 ring-1 ring-border/50 hover:ring-violet-500/30 transition-all">
                      <AvatarImage src={comment.user.image || undefined} />
                      <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                        {comment.user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/users/${comment.user.id}`}
                        className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      >
                        {comment.user.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                      {isOwn(comment.user.id) && (
                        <span className="text-[10px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">you</span>
                      )}
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Reply className="h-3 w-3" />
                        Reply
                      </button>
                      {comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {collapsedReplies.has(comment.id) ? (
                            <><ChevronDown className="h-3 w-3" /> {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</>
                          ) : (
                            <><ChevronUp className="h-3 w-3" /> Hide replies</>
                          )}
                        </button>
                      )}
                      {isOwn(comment.user.id) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover/thread:opacity-100"
                        >
                          {deletingId === comment.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          placeholder={`Reply to ${comment.user.name}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px] resize-none text-sm bg-muted/30 border-border/50 focus:border-violet-500/30"
                          autoFocus
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => { setReplyingTo(null); setReplyContent('') }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleReply(comment.id)}
                            disabled={submittingReply || !replyContent.trim()}
                          >
                            {submittingReply ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && !collapsedReplies.has(comment.id) && (
                  <div className="ml-10 space-y-1 border-l-2 border-border/30 pl-4 mt-1">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="group/reply flex gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                        <Link href={`/users/${reply.user.id}`} className="shrink-0">
                          <Avatar className="h-6 w-6 mt-0.5 ring-1 ring-border/50 hover:ring-violet-500/30 transition-all">
                            <AvatarImage src={reply.user.image || undefined} />
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                              {reply.user.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/users/${reply.user.id}`}
                              className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                            >
                              {reply.user.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                            {isOwn(reply.user.id) && (
                              <span className="text-[10px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">you</span>
                            )}
                            {isOwn(reply.user.id) && (
                              <button
                                onClick={() => handleDelete(reply.id)}
                                disabled={deletingId === reply.id}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover/reply:opacity-100"
                              >
                                {deletingId === reply.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-sm mt-0.5 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
