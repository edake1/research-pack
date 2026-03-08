'use client'

import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, Flame, Zap, Award, Star } from 'lucide-react'

interface ImpactScoreProps {
  thanksCount: number
  forkCount: number
  viewCount: number
  sourceCount: number
  variant?: 'badge' | 'detailed'
}

function computeScore(thanks: number, forks: number, views: number, sources: number) {
  // Weighted raw score
  const raw = (thanks * 10) + (forks * 15) + (views * 0.5) + (sources * 3)
  // Logarithmic scale to 100 — diminishing returns for very high numbers
  // At raw ~50, score ≈ 50. At raw ~500, score ≈ 85. At raw ~2000, score ≈ 95.
  const score = Math.min(100, Math.round((Math.log(raw + 1) / Math.log(2500)) * 100))
  return Math.max(0, score)
}

function getScoreTier(score: number) {
  if (score >= 85) return { label: 'Exceptional', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', icon: Award }
  if (score >= 65) return { label: 'High Impact', color: 'text-violet-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30', icon: Star }
  if (score >= 40) return { label: 'Growing', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', icon: Flame }
  if (score >= 15) return { label: 'Emerging', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', icon: Zap }
  return { label: 'New', color: 'text-muted-foreground', bgColor: 'bg-muted/50', borderColor: 'border-border/50', icon: TrendingUp }
}

export function ImpactScore({ thanksCount, forkCount, viewCount, sourceCount, variant = 'badge' }: ImpactScoreProps) {
  const score = useMemo(
    () => computeScore(thanksCount, forkCount, viewCount, sourceCount),
    [thanksCount, forkCount, viewCount, sourceCount]
  )
  const tier = useMemo(() => getScoreTier(score), [score])
  const TierIcon = tier.icon

  if (variant === 'detailed') {
    return (
      <div className={`rounded-xl border ${tier.borderColor} ${tier.bgColor} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TierIcon className={`h-4 w-4 ${tier.color}`} />
            <span className="text-sm font-medium">Impact Score</span>
          </div>
          <span className={`text-2xl font-bold ${tier.color}`}>{score}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              score >= 85 ? 'bg-amber-500' :
              score >= 65 ? 'bg-violet-500' :
              score >= 40 ? 'bg-blue-500' :
              score >= 15 ? 'bg-emerald-500' :
              'bg-muted-foreground/30'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs font-medium ${tier.color}`}>{tier.label}</span>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            <span>{thanksCount} thanks</span>
            <span>{forkCount} forks</span>
            <span>{viewCount} views</span>
          </div>
        </div>
      </div>
    )
  }

  // Badge variant — compact inline display
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${tier.borderColor} ${tier.bgColor} ${tier.color} cursor-default`}>
            <TierIcon className="h-3 w-3" />
            {score}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{tier.label} — Impact Score {score}/100</p>
          <p className="text-muted-foreground mt-0.5">
            Based on {thanksCount} thanks, {forkCount} forks, {viewCount} views
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Aggregate score for user profiles
export function UserImpactScore({ packs }: { packs: Array<{ thanksCount: number; forkCount: number; viewCount: number; _count?: { sources: number } }> }) {
  const totals = useMemo(() => {
    return packs.reduce(
      (acc, p) => ({
        thanks: acc.thanks + p.thanksCount,
        forks: acc.forks + p.forkCount,
        views: acc.views + p.viewCount,
        sources: acc.sources + (p._count?.sources || 0),
      }),
      { thanks: 0, forks: 0, views: 0, sources: 0 }
    )
  }, [packs])

  return (
    <ImpactScore
      thanksCount={totals.thanks}
      forkCount={totals.forks}
      viewCount={totals.views}
      sourceCount={totals.sources}
      variant="detailed"
    />
  )
}
