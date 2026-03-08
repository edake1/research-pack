'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Bell,
  GitFork,
  Heart,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  Check,
} from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
  actor: {
    id: string
    name: string | null
    image: string | null
  } | null
}

const typeIcons: Record<string, typeof GitFork> = {
  FORK: GitFork,
  THANKS: Heart,
  COMMENT: MessageSquare,
  SUGGESTION_RECEIVED: Lightbulb,
  SUGGESTION_ACCEPTED: CheckCircle2,
}

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

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // Silent fail
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [session, fetchNotifications])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: 'all' }),
      })
      setUnreadCount(0)
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
    } catch {
      // Silent fail
    }
  }

  if (!session?.user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet
            </p>
          ) : (
            notifications.map((notification) => {
              const Icon =
                typeIcons[notification.type] || Bell
              const content = (
                <div
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-violet-500/5' : ''
                  }`}
                >
                  {notification.actor ? (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={notification.actor.image || undefined}
                        alt={notification.actor.name || 'User'}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {notification.actor.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      {notification.actor && (
                        <span className="font-medium">
                          {notification.actor.name || 'Someone'}
                        </span>
                      )}{' '}
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                  )}
                </div>
              )

              return notification.link ? (
                <Link
                  key={notification.id}
                  href={notification.link}
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
