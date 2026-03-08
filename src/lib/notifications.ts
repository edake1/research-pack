import prisma from '@/lib/prisma'

type NotificationType =
  | 'FORK'
  | 'THANKS'
  | 'COMMENT'
  | 'SUGGESTION_RECEIVED'
  | 'SUGGESTION_ACCEPTED'

/**
 * Create an in-app notification for a user.
 * Silently fails — notifications should never break the main flow.
 */
export async function notify({
  userId,
  actorId,
  type,
  message,
  link,
}: {
  userId: string
  actorId?: string
  type: NotificationType
  message: string
  link?: string
}) {
  try {
    // Don't notify yourself
    if (actorId && actorId === userId) return

    await prisma.notification.create({
      data: {
        userId,
        actorId: actorId ?? null,
        type,
        message,
        link: link ?? null,
      },
    })
  } catch {
    // Silent fail — notifications are supplementary
  }
}
