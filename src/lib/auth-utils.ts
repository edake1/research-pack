import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Get the authenticated user's ID from the session.
 * Returns the user ID string or null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/**
 * Require authentication for an API route.
 * Returns the user ID or a 401 response.
 */
export async function requireAuth(): Promise<
  { userId: string; error?: never } | { userId?: never; error: NextResponse }
> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    }
  }
  return { userId }
}
