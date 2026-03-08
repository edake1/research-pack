import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="inline-flex items-center justify-center p-5 rounded-full bg-violet-500/10 mb-6">
        <FileQuestion className="h-12 w-12 text-violet-500" />
      </div>
      <h1 className="text-4xl font-bold mb-3">Page Not Found</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          asChild
        >
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" className="border-violet-500/30" asChild>
          <Link href="/packs/new">Create a Pack</Link>
        </Button>
      </div>
    </div>
  )
}
