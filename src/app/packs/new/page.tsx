'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { PackForm } from '@/components/PackForm'
import { Loader2 } from 'lucide-react'

export default function NewPackPage() {
  const { status } = useSession()
  const router = useRouter()

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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create a Research Pack</h1>
        <p className="text-muted-foreground mt-1">
          Share your research journey and help others learn faster.
        </p>
      </div>
      <PackForm />
    </div>
  )
}
