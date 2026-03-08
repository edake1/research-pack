'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Search, Plus, BookOpen, Sparkles, LogIn, LogOut, User, Menu } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  const user = session?.user

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            ResearchPack
          </span>
        </Link>

        {/* Search — hidden on mobile, shown in sheet */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
          <div className={`relative w-full transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
            <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-violet-500' : 'text-muted-foreground'}`} />
            <Input
              type="search"
              placeholder="Search packs, topics, or tags..."
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
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

          {/* Auth */}
          {status === 'loading' ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 ring-2 ring-violet-500/20 hover:ring-violet-500/40 transition-all">
                    <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-medium">
                      {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/users/${(user as any).id}`)}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              const searchInput = document.getElementById('mobile-search')
              if (searchInput) searchInput.focus()
              setMobileMenuOpen(true)
            }}
          >
            <Search className="h-4 w-4" />
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                {/* Mobile User Info */}
                {user && (
                  <div className="p-5 border-b border-border/50 bg-gradient-to-r from-violet-500/5 to-indigo-500/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-violet-500/20">
                        <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-medium">
                          {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Search */}
                <div className="p-4 border-b border-border/50">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="mobile-search"
                        type="search"
                        placeholder="Search packs..."
                        className="pl-10 h-10 border-border/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                </div>

                {/* Mobile Nav Links */}
                <div className="flex-1 p-4 space-y-1">
                  <Link
                    href="/packs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-violet-500" />
                    <span className="font-medium">Create Pack</span>
                  </Link>
                  <Link
                    href="/packs/ai-generate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <span className="font-medium">AI Generate</span>
                  </Link>
                  {user && (
                    <Link
                      href={`/users/${(user as any).id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">My Profile</span>
                    </Link>
                  )}
                </div>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
