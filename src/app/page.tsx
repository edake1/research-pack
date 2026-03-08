'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PackCard } from '@/components/PackCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  BookOpen,
  Users,
  GitFork,
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  TrendingUp,
  Loader2,
} from 'lucide-react'

interface Pack {
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
  _count: {
    sources: number
  }
  forkedFrom?: {
    id: string
    title: string
  } | null
}

const categories = [
  { name: 'Artificial Intelligence' },
  { name: 'Climate Science' },
  { name: 'Space Exploration' },
  { name: 'Quantum Computing' },
  { name: 'Finance & ML' },
  { name: 'Biology' },
]

const stats = [
  { label: 'Research Packs', value: '50+', icon: BookOpen },
  { label: 'Contributors', value: '12+', icon: Users },
  { label: 'Curated Sources', value: '200+', icon: Star },
]

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [packs, setPacks] = useState<Pack[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState(query)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ packs: 0, contributors: 0, sources: 0 })
  const [topics, setTopics] = useState<{ name: string; count: number }[]>([])
  const PAGE_SIZE = 12
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    fetchPacks(query)
    fetch('/api/stats').then(r => r.json()).then(data => {
      setStats(data)
      if (data.topics) setTopics(data.topics)
    }).catch(() => {})
  }, [query])

  const fetchPacks = async (q: string, offset = 0) => {
    if (offset === 0) setLoading(true)
    else setLoadingMore(true)
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
      if (q) params.set('q', q)
      const res = await fetch(`/api/packs?${params}`)
      const data = await res.json()
      if (offset === 0) {
        setPacks(data.packs || [])
      } else {
        setPacks(prev => [...prev, ...(data.packs || [])])
      }
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch packs:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative text-center py-12 md:py-16 space-y-7">
        {/* Background decoration */}
        <div className="absolute inset-0 hero-gradient pointer-events-none" />

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 animate-in fade-in-0 slide-in-from-top-4 duration-700">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Make research collaborative
          </span>
        </div>

        {/* Headline */}
        <div className="relative space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Make Research{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Reusable
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M2 6C50 2 100 2 198 6"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(139, 92, 246)" />
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            , Not Repetitive
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover curated research packs, fork them to add your findings, and share
            your knowledge with the community.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center bg-background rounded-xl border border-border/50 shadow-lg">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search research packs..."
              className="flex-1 h-12 pl-12 pr-2 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="default"
              className="mr-1.5"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Stats */}
        <div className="flex justify-center gap-10 pt-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
          {[
            { label: 'Research Packs', value: stats.packs, icon: BookOpen },
            { label: 'Contributors', value: stats.contributors, icon: Users },
            { label: 'Curated Sources', value: stats.sources, icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xl font-semibold">
                  {stat.value}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Browse by Topic</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(topics.length > 0 ? topics : categories.map(c => ({ name: c.name, count: 0 }))).slice(0, 12).map((topic, index) => (
            <button
              key={topic.name}
              onClick={() => {
                setSearchQuery(topic.name)
                router.push(`/?q=${encodeURIComponent(topic.name)}`)
              }}
              className="group relative p-4 rounded-xl border border-border/50 bg-card/50 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-200 text-left"
            >
              <p className="font-medium text-sm truncate">{topic.name}</p>
              {topic.count > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{topic.count} pack{topic.count !== 1 ? 's' : ''}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Pack */}
      {packs[0] && !query && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-500" />
            <h2 className="text-2xl font-bold">Featured Pack</h2>
          </div>
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 blur-3xl" />
            <CardContent className="relative p-8">
              <div className="flex items-start gap-6">
                <div className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                      {packs[0].topic}
                    </Badge>
                    {packs[0].forkedFrom && (
                      <Badge variant="outline" className="text-violet-600 border-violet-500/30">
                        <GitFork className="h-3 w-3 mr-1" />
                        Forked
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{packs[0].title}</h3>
                  <p className="text-muted-foreground mb-4 text-lg">{packs[0].description}</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-medium text-sm">
                        {packs[0].creator.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{packs[0].creator.name}</p>
                        <p className="text-xs text-muted-foreground">Creator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {packs[0]._count.sources} sources
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {packs[0].thanksCount} thanks
                      </span>
                    </div>
                    <Button
                      className="ml-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                      onClick={() => router.push(`/packs/${packs[0].id}`)}
                    >
                      View Pack
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* AI Generate CTA */}
      <section className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-card">
        <div className="relative p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Let AI Do Your Research</h3>
                <p className="text-muted-foreground">
                  Enter any topic and AI will create a comprehensive research pack for you in seconds.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 btn-shine"
              asChild
            >
              <a href="/packs/ai-generate">
                <Sparkles className="mr-2 h-5 w-5" />
                Try AI Generate
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Research Packs Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {query ? `Results for "${query}"` : 'Recent Research Packs'}
          </h2>
          {query && (
            <Button variant="ghost" onClick={() => router.push('/')}>
              Clear search
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl shimmer animate-pulse" />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-violet-500/10 mb-4">
                <BookOpen className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No packs found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {query
                  ? 'Try a different search term or browse all packs'
                  : 'Be the first to create a research pack!'}
              </p>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" asChild>
                <a href="/packs/new">Create a Pack</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.slice(query ? 0 : 1).map((pack, index) => (
              <div
                key={pack.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PackCard pack={pack} />
              </div>
            ))}
          </div>
          {packs.length < total && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                className="border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
                onClick={() => fetchPacks(query, packs.length)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                ) : (
                  `Load More (${packs.length} of ${total})`
                )}
              </Button>
            </div>
          )}
          </>
        )}
      </section>

      {/* How It Works */}
      <section className="rounded-xl border border-border/50 bg-card/50 p-6 md:p-8">
        <h2 className="text-lg font-semibold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Discover', desc: 'Search packs on any topic — curated sources, notes, and key takeaways.', icon: BookOpen },
            { step: '2', title: 'Fork & Improve', desc: 'Fork useful packs and add your findings. Original creators get credit.', icon: GitFork },
            { step: '3', title: 'Share', desc: 'Create packs and share your research journey. Help others learn faster.', icon: Users },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-bold">
                {item.step}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-medium mb-0.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
