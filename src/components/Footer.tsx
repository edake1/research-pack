'use client'

import Link from 'next/link'
import { BookOpen, Github, Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
      <div className="container px-6 md:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Lumen
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Make research reusable, not repetitive. Package, share, and fork knowledge.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Browse Packs</Link></li>
              <li><Link href="/packs/new" className="hover:text-foreground transition-colors">Create Pack</Link></li>
              <li><Link href="/packs/ai-generate" className="hover:text-foreground transition-colors">AI Generate</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://github.com/edake1/research-pack" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">GitHub <Github className="h-3 w-3" /></a></li>
              <li><Link href="/auth/signin" className="hover:text-foreground transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold mb-3">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built for researchers, students, and anyone who learns in public. Inspired by how GitHub changed code collaboration.
            </p>
          </div>
        </div>

        <Separator className="my-6 bg-border/40" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lumen. Open-source research platform.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> using Next.js & Prisma
          </p>
        </div>
      </div>
    </footer>
  )
}
