'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PackCard } from '@/components/PackCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, BookOpen, Loader2, ArrowLeft, Tag, SlidersHorizontal } from 'lucide-react'

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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [packs, setPacks] = useState<Pack[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState(query)
  const [relatedTags, setRelatedTags] = useState<string[]>([])
  const PAGE_SIZE = 12
  const router = useRouter()

  useEffect(() => {
    setSearchQuery(query)
    fetchPacks(query)
  }, [query])

  const fetchPacks = async (q: string, offset = 0) => {
    if (offset === 0) setLoading(true)
    else setLoadingMore(true)
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
      if (q) params.set('q', q)
      const res = await fetch(`/api/packs?${params}`)
      const data = await res.json()
      const fetchedPacks = data.packs || []
      if (offset === 0) {
        setPacks(fetchedPacks)
        // Extract related tags from results
        const allTags = new Set<string>()
        fetchedPacks.forEach((p: Pack) => {
          p.tags.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => {
            if (t.toLowerCase() !== q.toLowerCase()) allTags.add(t)
          })
        })
        setRelatedTags(Array.from(allTags).slice(0, 8))
      } else {
        setPacks(prev => [...prev, ...fetchedPacks])
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
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search packs, topics, or tags..."
                className="pl-10 h-12 text-base border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
          </div>
        </form>

        {/* Query info */}
        {query && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold">
                Results for &ldquo;{query}&rdquo;
              </h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              {total} pack{total !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>

      {/* Related tags */}
      {relatedTags.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">Related:</span>
          {relatedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
            >
              <Badge
                variant="outline"
                className="px-3 py-1 border-border/50 hover:bg-muted/50 hover:border-border cursor-pointer transition-colors"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : packs.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No packs found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {query
              ? `We couldn't find any packs matching "${query}". Try a different search term.`
              : 'Enter a search term to find research packs.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              Browse All Packs
            </Button>
            <Button onClick={() => router.push('/packs/new')}>
              Create a Pack
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack, index) => (
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
    </div>
  )
}
