'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PackForm } from '@/components/PackForm'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EditPackPage() {
  const params = useParams()
  const router = useRouter()
  const packId = params.id as string
  const { data: session, status } = useSession()
  const currentUserId = (session?.user as any)?.id ?? null

  const [pack, setPack] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      toast.error('Please sign in to edit packs')
      router.push('/auth/signin')
      return
    }

    fetchPack()
  }, [packId, status])

  const fetchPack = async () => {
    try {
      const res = await fetch(`/api/packs/${packId}`)
      if (!res.ok) throw new Error('Pack not found')
      const data = await res.json()

      if (data.creator.id !== currentUserId) {
        toast.error('You can only edit your own packs')
        router.push(`/packs/${packId}`)
        return
      }

      setPack(data)
    } catch {
      toast.error('Failed to load pack')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600 mx-auto" />
          <p className="text-muted-foreground">Loading pack editor...</p>
        </div>
      </div>
    )
  }

  if (!pack) return null

  return (
    <div className="max-w-4xl mx-auto">
      <PackForm
        initialData={{
          id: pack.id,
          title: pack.title,
          description: pack.description,
          topic: pack.topic,
          tags: pack.tags,
          sources: pack.sources.map((s: any) => ({
            url: s.url,
            title: s.title,
            type: s.type,
            notes: s.notes || '',
            relevanceRating: s.relevanceRating,
          })),
          takeaways: pack.takeaways.map((t: any) => ({
            content: t.content,
          })),
        }}
        isEditing
      />
    </div>
  )
}
