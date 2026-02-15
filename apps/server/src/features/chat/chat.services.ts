import { db } from '../../db/db.js'
import { matches, messages } from '../../db/schema.js'
import { and, eq, or, desc, lt, ne, isNull, count } from 'drizzle-orm'

export const verifyMatchParticipant = async (matchId: number, userId: number) => {
  const [match] = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(
          eq(matches.userId, userId),
          eq(matches.matchedUserId, userId)
        )
      )
    )
    .limit(1)

  return match ?? null
}

export const getMessages = async (matchId: number, limit = 50, beforeId?: number) => {
  const conditions = [eq(messages.matchId, matchId)]
  if (beforeId) {
    conditions.push(lt(messages.id, beforeId))
  }

  const rows = await db
    .select({
      id: messages.id,
      matchId: messages.matchId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
      readAt: messages.readAt,
    })
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.id))
    .limit(limit)

  return rows.reverse()
}

export const createMessage = async (matchId: number, senderId: number, content: string) => {
  const [msg] = await db
    .insert(messages)
    .values({ matchId, senderId, content })
    .returning()

  await db.update(matches)
    .set({ lastMessageAt: new Date() })
    .where(eq(matches.id, matchId))

  return msg
}

export const markMessagesRead = async (matchId: number, recipientId: number) => {
  const result = await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.matchId, matchId),
        ne(messages.senderId, recipientId),
        isNull(messages.readAt)
      )
    )
    .returning({ id: messages.id })

  return result.length
}

export const getUnreadCounts = async (userId: number) => {
  const rows = await db
    .select({
      matchId: messages.matchId,
      count: count(messages.id),
    })
    .from(messages)
    .innerJoin(matches, eq(messages.matchId, matches.id))
    .where(
      and(
        or(
          eq(matches.userId, userId),
          eq(matches.matchedUserId, userId)
        ),
        ne(messages.senderId, userId),
        isNull(messages.readAt)
      )
    )
    .groupBy(messages.matchId)

  return rows // { "unreadCounts": [{ "matchId": 5, "count": 3 }, { "matchId": 12, "count": 1 }] }
}