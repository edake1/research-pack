'use client'

import * as React from 'react'
import { Moon, Sun, Palette, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

const themes = [
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'Dark', value: 'dark', icon: Moon },
  { name: 'System', value: 'system', icon: Monitor },
]

const colorThemes = [
  { name: 'Violet', value: 'violet', color: '#8B5CF6' },
  { name: 'Ocean', value: 'ocean', color: '#0EA5E9' },
  { name: 'Forest', value: 'forest', color: '#22C55E' },
  { name: 'Rose', value: 'rose', color: '#F43F5E' },
  { name: 'Amber', value: 'amber', color: '#F59E0B' },
  { name: 'Slate', value: 'slate', color: '#64748B' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="flex items-center gap-2"
          >
            <t.icon className="h-4 w-4" />
            {t.name}
            {theme === t.value && (
              <span className="ml-auto text-violet-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Accent Color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {colorThemes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => {
              document.documentElement.setAttribute('data-accent', t.value)
              localStorage.setItem('accent-theme', t.value)
            }}
            className="flex items-center gap-2"
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
