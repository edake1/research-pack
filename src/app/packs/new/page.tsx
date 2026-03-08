'use client'

import { PackForm } from '@/components/PackForm'

export default function NewPackPage() {
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
