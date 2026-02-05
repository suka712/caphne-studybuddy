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

  let recentMatchQuery = db
    .select({ createdAt: matches.createdAt })
    .from(matches)
    .where(
      adminId
        ? and(eq(matches.userId, userId), ne(matches.matchedUserId, adminId!))
        : eq(matches.userId, userId)
    )
    .orderBy(desc(matches.createdAt))
    .limit(1)

  const [recentMatch] = await recentMatchQuery

  if (recentMatch?.createdAt) {
    const elapsed = Date.now() - recentMatch.createdAt.getTime()
    if (elapsed < matchConfig.matchCooldownMs) {
      const nextMatchAt = new Date(recentMatch.createdAt.getTime() + matchConfig.matchCooldownMs)
      return { error: 'cooldown' as const, nextMatchAt }
    }
  }

  const existingMatches = await db
    .select({ matchedUserId: matches.matchedUserId })
    .from(matches)
    .where(eq(matches.userId, userId))

  const excludeIds = [userId, ...existingMatches.map(m => m.matchedUserId)]

  const candidates = await db
    .select()
    .from(users)
    .where(notInArray(users.id, excludeIds))
    .orderBy(sql`RANDOM()`)
    .limit(matchConfig.matchesPerRound)

  if (candidates.length === 0) {
    return { matches: [] }
  }

  const newRows = await db
    .insert(matches)
    .values(candidates.map(c => ({
      userId,
      matchedUserId: c.id,
    })))
    .returning()

  return { matches: newRows }
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

  const [recentMatch] = await db
    .select({ createdAt: matches.createdAt })
    .from(matches)
    .where(
      adminId
        ? and(eq(matches.userId, userId), ne(matches.matchedUserId, adminId!))
        : eq(matches.userId, userId)
    )
    .orderBy(desc(matches.createdAt))
    .limit(1)

  let nextMatchAt: Date | null = null
  if (recentMatch?.createdAt) {
    const nextTime = recentMatch.createdAt.getTime() + matchConfig.matchCooldownMs
    if (nextTime > Date.now()) {
      nextMatchAt = new Date(nextTime)
    }
  }

  return { matches: userMatches, nextMatchAt }
}
