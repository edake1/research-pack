'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PackCard } from '@/components/PackCard'
import { ArrowLeft, Loader2, BookOpen, GitFork, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  createdAt: string
  packs: Array<{
    id: string
    title: string
    description: string
    topic: string
    tags: string
    viewCount: number
    thanksCount: number
    forkCount: number
    creator: { id: string; name: string; avatar: string | null }
    _count: { sources: number; thanks: number }
  }>
  forkedPacks: Array<{
    id: string
    title: string
    description: string
    topic: string
    tags: string
    viewCount: number
    thanksCount: number
    forkCount: number
    creator: { id: string; name: string; avatar: string | null }
    forkedFrom: { id: string; title: string } | null
    _count: { sources: number }
  }>
  _count: {
    packs: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) throw new Error('User not found')
      const data = await res.json()
      setUser(data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
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
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  const totalThanks = user.packs.reduce((acc, p) => acc + p.thanksCount, 0)
  const totalViews = user.packs.reduce((acc, p) => acc + p.viewCount, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Profile Header */}
      <Card className="border-border/50 overflow-hidden">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWOGgydjh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>

        <CardContent className="relative pt-0 pb-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-10">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-4 sm:pt-0">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.bio && (
                <p className="text-muted-foreground mt-1">{user.bio}</p>
              )}
            </div>
            <Button
              variant="outline"
              className="border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
              onClick={() => toast.info('Follow feature coming soon!')}
            >
              Follow
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center p-3 rounded-xl bg-violet-500/5">
              <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {user.packs.length}
              </div>
              <div className="text-sm text-muted-foreground">Packs Created</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-indigo-500/5">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {user.forkedPacks.length}
              </div>
              <div className="text-sm text-muted-foreground">Forks</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-500/5">
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {totalThanks}
              </div>
              <div className="text-sm text-muted-foreground">Thanks Received</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-500/5">
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {totalViews}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="created" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="created" className="data-[state=active]:bg-background">
            <BookOpen className="h-4 w-4 mr-2" />
            Created ({user.packs.length})
          </TabsTrigger>
          <TabsTrigger value="forked" className="data-[state=active]:bg-background">
            <GitFork className="h-4 w-4 mr-2" />
            Forked ({user.forkedPacks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          {user.packs.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No packs created yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="forked">
          {user.forkedPacks.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <GitFork className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No forked packs yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.forkedPacks.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
