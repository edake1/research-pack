'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, Sparkles, Loader2, Star, FileText, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface Source {
  url: string
  title: string
  type: string
  notes: string
  relevanceRating: number | null
}

interface Takeaway {
  content: string
}

interface PackFormProps {
  initialData?: {
    id: string
    title: string
    description: string
    topic: string
    tags: string
    sources: Source[]
    takeaways: Takeaway[]
  }
  isEditing?: boolean
}

const sourceTypes = ['article', 'video', 'paper', 'book', 'podcast']

const typeColors: Record<string, string> = {
  article: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  video: 'bg-red-500/10 text-red-600 border-red-500/30',
  paper: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  book: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  podcast: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
}

export function PackForm({ initialData, isEditing = false }: PackFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)

  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [topic, setTopic] = useState(initialData?.topic || '')
  const [tags, setTags] = useState(initialData?.tags || '')
  const [sources, setSources] = useState<Source[]>(initialData?.sources || [])
  const [takeaways, setTakeaways] = useState<Takeaway[]>(initialData?.takeaways || [])

  const addSource = () => {
    setSources([...sources, { url: '', title: '', type: 'article', notes: '', relevanceRating: null }])
  }

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index))
  }

  const updateSource = (index: number, field: keyof Source, value: string | number | null) => {
    const updated = [...sources]
    updated[index] = { ...updated[index], [field]: value }
    setSources(updated)
  }

  const addTakeaway = () => {
    setTakeaways([...takeaways, { content: '' }])
  }

  const removeTakeaway = (index: number) => {
    setTakeaways(takeaways.filter((_, i) => i !== index))
  }

  const updateTakeaway = (index: number, content: string) => {
    const updated = [...takeaways]
    updated[index] = { content }
    setTakeaways(updated)
  }

  const handleAISuggest = async () => {
    if (!topic) {
      toast.error('Please enter a topic first')
      return
    }

    setIsSuggesting(true)
    try {
      const res = await fetch('/api/ai/suggest-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      if (!res.ok) throw new Error('Failed to get suggestions')

      const data = await res.json()
      const suggestedSources = data.sources.map((s: { title: string; url: string; type: string; description?: string }) => ({
        url: s.url,
        title: s.title,
        type: s.type || 'article',
        notes: s.description || '',
        relevanceRating: null,
      }))

      setSources([...sources, ...suggestedSources])
      toast.success(`Added ${suggestedSources.length} suggested sources`)
    } catch (error) {
      toast.error('Failed to get AI suggestions')
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !topic) {
      toast.error('Please fill in all required fields')
      return
    }

    const validSources = sources.filter(s => s.url && s.title)
    const validTakeaways = takeaways.filter(t => t.content)

    setIsSubmitting(true)
    try {
      const users = await fetch('/api/users/first').then(r => r.json()).catch(() => null)
      const creatorId = users?.id

      if (!creatorId) {
        toast.error('No user found. Please sign in.')
        setIsSubmitting(false)
        return
      }

      const url = isEditing ? `/api/packs/${initialData?.id}` : '/api/packs'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          topic,
          tags,
          sources: validSources,
          takeaways: validTakeaways,
          creatorId,
        }),
      })

      if (!res.ok) throw new Error('Failed to save pack')

      const pack = await res.json()
      toast.success(isEditing ? 'Pack updated!' : 'Pack created!')
      router.push(`/packs/${pack.id}`)
    } catch (error) {
      toast.error('Failed to save pack')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <FileText className="h-4 w-4 text-violet-500" />
            </div>
            Basic Information
          </CardTitle>
          <CardDescription>
            Tell others what your research pack is about
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Machine Learning"
              className="h-11 border-border/50 focus:border-violet-500/50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what this research pack covers and who would benefit from it..."
              rows={3}
              className="border-border/50 focus:border-violet-500/50 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Artificial Intelligence"
                className="h-11 border-border/50 focus:border-violet-500/50"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-base">Tags</Label>
              <Input
                id="tags"
                placeholder="e.g., ML, AI, Python (comma separated)"
                className="h-11 border-border/50 focus:border-violet-500/50"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                Sources
              </CardTitle>
              <CardDescription>
                Add the sources you used in your research
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAISuggest}
                disabled={isSuggesting}
                className="border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
              >
                {isSuggesting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
                )}
                AI Suggest
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSource}
                className="border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {sources.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-4">
                No sources added yet. Add sources manually or use AI suggestions.
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSource}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manually
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAISuggest}
                  disabled={isSuggesting || !topic}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
                  AI Suggest
                </Button>
              </div>
            </div>
          )}
          {sources.map((source, index) => (
            <div
              key={index}
              className="relative border rounded-xl p-5 space-y-4 bg-gradient-to-br from-background to-muted/30 border-border/50"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeSource(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">URL</Label>
                  <Input
                    placeholder="https://..."
                    className="h-10 border-border/50"
                    value={source.url}
                    onChange={(e) => updateSource(index, 'url', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <Input
                    placeholder="Source title"
                    className="h-10 border-border/50"
                    value={source.title}
                    onChange={(e) => updateSource(index, 'title', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select
                    value={source.type}
                    onValueChange={(value) => updateSource(index, 'type', value)}
                  >
                    <SelectTrigger className="h-10 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${typeColors[type].split(' ')[0]}`} />
                            {type}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Relevance</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => updateSource(index, 'relevanceRating', rating)}
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${
                            source.relevanceRating && rating <= source.relevanceRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300 hover:text-amber-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Textarea
                  placeholder="Why is this source useful? What did you learn from it?"
                  rows={2}
                  className="border-border/50 resize-none"
                  value={source.notes}
                  onChange={(e) => updateSource(index, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Takeaways */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                Key Takeaways
              </CardTitle>
              <CardDescription>
                What are the main insights from your research?
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTakeaway}
              className="border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Takeaway
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {takeaways.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Add key takeaways to help others quickly understand your findings.</p>
            </div>
          )}
          {takeaways.map((takeaway, index) => (
            <div key={index} className="flex gap-3 items-start group">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-medium shrink-0 mt-1.5 shadow-lg shadow-violet-500/20">
                {index + 1}
              </span>
              <Textarea
                placeholder="Key insight or conclusion..."
                rows={2}
                className="flex-1 border-border/50 resize-none"
                value={takeaway.content}
                onChange={(e) => updateTakeaway(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => removeTakeaway(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="min-w-24"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-32 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 btn-shine"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {isEditing ? 'Update Pack' : 'Create Pack'}
        </Button>
      </div>
    </form>
  )
}
