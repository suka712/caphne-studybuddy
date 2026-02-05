import { matchConfig } from "../../config/matching.js"
import { db } from "../../db/db.js"
import { matches, users, profiles } from "../../db/schema.js"
import { and, desc, eq, ne, notInArray, sql } from 'drizzle-orm'

const ensureAdminMatch = async (userId: number) => {
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, matchConfig.adminEmail))
    .limit(1)

  if (!admin || admin.id === userId) {
    return
  }

  const [existing] = await db
    .select()
    .from(matches)
    .where(and(
      eq(matches.userId, userId),
      eq(matches.matchedUserId, admin.id)
    ))
    .limit(1)

  if (existing) {
    return
  }

  await db.insert(matches).values({
    userId,
    matchedUserId: admin.id,
  })
}

export const generateMatches = async (userId: number) => {
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, matchConfig.adminEmail))
    .limit(1)

  const adminId = admin?.id
  const now = Date.now()
  const windowStart = new Date(now - matchConfig.windowMs)

  const nonAdminFilter = adminId
    ? and(eq(matches.userId, userId), ne(matches.matchedUserId, adminId!))
    : eq(matches.userId, userId)

  // Count matches in the current 24h window
  const recentMatches = await db
    .select({ createdAt: matches.createdAt })
    .from(matches)
    .where(and(nonAdminFilter, sql`${matches.createdAt} >= ${windowStart}`))
    .orderBy(desc(matches.createdAt))

  // If all tries used, cooldown until oldest match in window expires
  if (recentMatches.length >= matchConfig.matchesPerWindow) {
    const oldest = recentMatches[recentMatches.length - 1]!
    const nextMatchAt = new Date(oldest.createdAt.getTime() + matchConfig.windowMs)
    return { error: 'cooldown' as const, nextMatchAt }
  }

  // 1-minute cooldown between individual matches
  if (recentMatches.length > 0) {
    const lastMatch = recentMatches[0]!
    const elapsed = now - lastMatch.createdAt.getTime()
    if (elapsed < matchConfig.cooldownBetweenMatchesMs) {
      const nextMatchAt = new Date(lastMatch.createdAt.getTime() + matchConfig.cooldownBetweenMatchesMs)
      return { error: 'cooldown' as const, nextMatchAt }
    }
  }

  // Find 1 new candidate
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

  const userMatches = await db
    .select({
      matchId: matches.id,
      displayName: profiles.displayName,
      major: profiles.major,
      year: profiles.year,
      photoUrl: profiles.photoUrl,
      matchedAt: matches.createdAt,
    })
    .from(matches)
    .innerJoin(users, eq(matches.matchedUserId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(matches.userId, userId))
    .orderBy(desc(matches.createdAt))

  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, matchConfig.adminEmail))
    .limit(1)

  const adminId = admin?.id
  const now = Date.now()
  const windowStart = new Date(now - matchConfig.windowMs)

  const nonAdminFilter = adminId
    ? and(eq(matches.userId, userId), ne(matches.matchedUserId, adminId!))
    : eq(matches.userId, userId)

  const recentMatches = await db
    .select({ createdAt: matches.createdAt })
    .from(matches)
    .where(and(nonAdminFilter, sql`${matches.createdAt} >= ${windowStart}`))
    .orderBy(desc(matches.createdAt))

  let nextMatchAt: Date | null = null
  const remainingMatches = matchConfig.matchesPerWindow - recentMatches.length

  if (remainingMatches <= 0) {
    // All tries used — next match when the oldest in window expires
    const oldest = recentMatches[recentMatches.length - 1]!
    nextMatchAt = new Date(oldest.createdAt.getTime() + matchConfig.windowMs)
  } else if (recentMatches.length > 0) {
    // Check 1-minute cooldown from last match
    const lastMatch = recentMatches[0]!
    const nextTime = lastMatch.createdAt.getTime() + matchConfig.cooldownBetweenMatchesMs
    if (nextTime > now) {
      nextMatchAt = new Date(nextTime)
    }
  }

  return { matches: userMatches, nextMatchAt, remainingMatches: Math.max(0, remainingMatches) }
}
