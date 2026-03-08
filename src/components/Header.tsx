'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, BookOpen, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              ResearchPack
            </span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
            <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-violet-500' : 'text-muted-foreground'}`} />
            <Input
              type="search"
              placeholder="Search research packs, topics, or tags..."
              className={`pl-10 h-11 bg-background/50 border-border/50 transition-all duration-200 ${
                isFocused
                  ? 'border-violet-500/50 ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/5'
                  : 'hover:border-border'
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link href="/packs/new">
            <Button className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 btn-shine">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Pack
            </Button>
          </Link>

          <Link href="/packs/ai-generate">
            <Button variant="outline" className="border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-200">
              <Sparkles className="h-4 w-4 mr-1.5 text-violet-500" />
              AI Generate
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
