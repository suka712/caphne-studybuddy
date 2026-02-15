import { matchConfig } from "../../config/matching.js"
import { db } from "../../db/db.js"
import { matches, messages, users, profiles } from "../../db/schema.js"
import { and, count, desc, eq, gte, isNull, ne, notInArray, sql } from 'drizzle-orm'
import { userIsOnline } from '../chat/socket.js'

const getAdminId = async () => {
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, matchConfig.adminEmail))
    .limit(1)
  return admin?.id
}

const getRecentMatchTimestamps = async (userId: number, adminId: number | undefined, windowStart: Date) => {
  const filter = adminId
    ? and(eq(matches.userId, userId), ne(matches.matchedUserId, adminId))
    : eq(matches.userId, userId)

  return db
    .select({ createdAt: matches.createdAt })
    .from(matches)
    .where(and(filter, gte(matches.createdAt, windowStart)))
    .orderBy(desc(matches.createdAt))
}

const ensureAdminMatch = async (userId: number) => {
  const adminId = await getAdminId()
  if (!adminId || adminId === userId) return

  const [existing] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(and(
      eq(matches.userId, userId),
      eq(matches.matchedUserId, adminId)
    ))
    .limit(1)

  if (!existing) {
    await db.insert(matches).values({ userId, matchedUserId: adminId })
  }
}

export const generateMatches = async (userId: number) => {
  const adminId = await getAdminId()
  const now = Date.now()
  const windowStart = new Date(now - matchConfig.windowMs)

  const recentMatches = await getRecentMatchTimestamps(userId, adminId, windowStart)

  if (recentMatches.length >= matchConfig.matchesPerWindow) {
    const oldest = recentMatches[recentMatches.length - 1]!
    const nextMatchAt = new Date(oldest.createdAt.getTime() + matchConfig.windowMs)
    return { error: 'cooldown' as const, nextMatchAt }
  }

  if (recentMatches.length > 0) {
    const lastMatch = recentMatches[0]!
    const elapsed = now - lastMatch.createdAt.getTime()
    if (elapsed < matchConfig.cooldownBetweenMatchesMs) {
      const nextMatchAt = new Date(lastMatch.createdAt.getTime() + matchConfig.cooldownBetweenMatchesMs)
      return { error: 'cooldown' as const, nextMatchAt }
    }
  }

  const existingMatches = await db
    .select({ matchedUserId: matches.matchedUserId })
    .from(matches)
    .where(eq(matches.userId, userId))

  const excludeIds = [userId, ...existingMatches.map(m => m.matchedUserId)]

  const [candidate] = await db
    .select()
    .from(users)
    .where(notInArray(users.id, excludeIds))
    .orderBy(sql`RANDOM()`)
    .limit(1)

  if (!candidate) {
    return { match: null }
  }

  const [newRow] = await db
    .insert(matches)
    .values({ userId, matchedUserId: candidate.id })
    .returning()

  return { match: newRow }
}

export const getAllMatches = async (userId: number) => {
  await ensureAdminMatch(userId)

  const unreadSq = db
    .select({
      matchId: messages.matchId,
      unreadCount: count(messages.id).as('unread_count'),
    })
    .from(messages)
    .where(and(
      ne(messages.senderId, userId),
      isNull(messages.readAt)
    ))
    .groupBy(messages.matchId)
    .as('unread_sq')

  const selectFields = {
    matchId: matches.id,
    matchedUserId: users.id,
    displayName: profiles.displayName,
    major: profiles.major,
    year: profiles.year,
    photoUrl: profiles.photoUrl,
    matchedAt: matches.createdAt,
    lastActiveAt: users.lastActiveAt,
    unreadCount: sql<number>`coalesce(${unreadSq.unreadCount}, 0)`.as('unread_count'),
    lastMessageAt: matches.lastMessageAt,
  }

  const initiated = await db
    .select(selectFields)
    .from(matches)
    .innerJoin(users, eq(matches.matchedUserId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(unreadSq, eq(unreadSq.matchId, matches.id))
    .where(eq(matches.userId, userId))

  const received = await db
    .select(selectFields)
    .from(matches)
    .innerJoin(users, eq(matches.userId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(unreadSq, eq(unreadSq.matchId, matches.id))
    .where(eq(matches.matchedUserId, userId))

  const seen = new Set<number>()
  const userMatches = [...initiated, ...received]
    .sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.matchedAt).getTime()
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.matchedAt).getTime()
      return bTime - aTime
    })
    .filter(m => {
      if (seen.has(m.matchId)) return false
      seen.add(m.matchId)
      return true
    })
    .map(({ matchedUserId, unreadCount, ...rest }) => ({
      ...rest,
      unreadCount: Number(unreadCount),
      isOnline: userIsOnline(matchedUserId)
    }))

  const adminId = await getAdminId()
  const now = Date.now()
  const windowStart = new Date(now - matchConfig.windowMs)

  const recentMatches = await getRecentMatchTimestamps(userId, adminId, windowStart)

  let nextMatchAt: Date | null = null
  const remainingMatches = matchConfig.matchesPerWindow - recentMatches.length

  if (remainingMatches <= 0) {
    const oldest = recentMatches[recentMatches.length - 1]!
    nextMatchAt = new Date(oldest.createdAt.getTime() + matchConfig.windowMs)
  } else if (recentMatches.length > 0) {
    const lastMatch = recentMatches[0]!
    const nextTime = lastMatch.createdAt.getTime() + matchConfig.cooldownBetweenMatchesMs
    if (nextTime > now) {
      nextMatchAt = new Date(nextTime)
    }
  }

  return { matches: userMatches, nextMatchAt, remainingMatches: Math.max(0, remainingMatches) }
}