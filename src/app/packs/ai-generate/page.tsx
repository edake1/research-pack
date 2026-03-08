'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Loader2, BookOpen, Video, FileText, Headphones, Newspaper, ArrowRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const suggestions = [
  { topic: 'Machine Learning Fundamentals', icon: '🤖' },
  { topic: 'Climate Change Solutions', icon: '🌍' },
  { topic: 'Space Exploration Technologies', icon: '🚀' },
  { topic: 'Quantum Computing Basics', icon: '⚛️' },
  { topic: 'Blockchain & Web3', icon: '⛓️' },
  { topic: 'Neuroscience & Brain Research', icon: '🧠' },
]

export default function AIGeneratePage() {
  const router = useRouter()
  const { status } = useSession()
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPack, setGeneratedPack] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  const handleGenerate = async (topicToGenerate?: string) => {
    const finalTopic = topicToGenerate || topic
    if (!finalTopic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setIsGenerating(true)
    setGeneratedPack(null)

    try {
      const res = await fetch('/api/ai/generate-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: finalTopic }),
      })

      if (!res.ok) throw new Error('Failed to generate pack')

      const pack = await res.json()
      setGeneratedPack(pack)
      toast.success('Research pack generated!')
    } catch (error) {
      toast.error('Failed to generate pack. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleViewPack = () => {
    if (generatedPack) {
      router.push(`/packs/${generatedPack.id}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">AI-Powered Research</span>
        </div>
        <h1 className="text-4xl font-bold">
          Let AI Create Your{' '}
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Research Pack
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter any topic and our AI will curate a comprehensive research pack with relevant sources, notes, and key takeaways.
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Enter a topic (e.g., Introduction to Neural Networks)"
                className="h-12 text-lg border-border/50 focus:border-violet-500/50 focus:ring-violet-500/20"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <Button
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
              onClick={() => handleGenerate()}
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Generate Pack
                </>
              )}
            </Button>
          </div>

          {/* Suggestions */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Try one of these topics:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.topic}
                  onClick={() => {
                    setTopic(s.topic)
                    handleGenerate(s.topic)
                  }}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-background border border-border/50 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all disabled:opacity-50"
                >
                  <span>{s.icon}</span>
                  {s.topic}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isGenerating && (
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/30 blur-xl animate-pulse" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Creating Your Research Pack</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  AI is searching for the best sources and insights...
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>This may take a few seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Pack Preview */}
      {generatedPack && !isGenerating && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{generatedPack.topic}</Badge>
                    <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 border-0 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{generatedPack.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {generatedPack.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Sources */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-500" />
                  Sources ({generatedPack.sources?.length || 0})
                </h4>
                <div className="grid gap-3">
                  {generatedPack.sources?.map((source: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-violet-500/5 transition-colors"
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        source.type === 'video' ? 'bg-red-500/10 text-red-500' :
                        source.type === 'paper' ? 'bg-emerald-500/10 text-emerald-500' :
                        source.type === 'book' ? 'bg-purple-500/10 text-purple-500' :
                        source.type === 'podcast' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {source.type === 'video' ? <Video className="h-4 w-4" /> :
                         source.type === 'paper' ? <FileText className="h-4 w-4" /> :
                         source.type === 'book' ? <BookOpen className="h-4 w-4" /> :
                         source.type === 'podcast' ? <Headphones className="h-4 w-4" /> :
                         <Newspaper className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{source.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{(() => { try { return new URL(source.url).hostname } catch { return source.url } })()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {source.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaways */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {generatedPack.takeaways?.map((takeaway: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/10 text-violet-500 text-xs font-medium shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{takeaway.content}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  onClick={handleViewPack}
                >
                  View Full Pack
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
