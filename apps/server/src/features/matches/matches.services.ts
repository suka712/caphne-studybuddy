import { db } from "../../db/db.js"
import { matches, users, profiles } from "../../db/schema.js"
import { and, desc, eq, ne, notInArray, sql } from 'drizzle-orm'

const ADMIN_EMAIL = 'khiemnguyen.hye@gmail.com' // Hard coded match
const MATCH_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours
const MATCHES_PER_ROUND = 3

const ensureAdminMatch = async (userId: number) => {
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1)

  if (!admin || admin.id === userId) return

  const [existing] = await db
    .select()
    .from(matches)
    .where(and(
      eq(matches.userId, userId),
      eq(matches.matchedUserId, admin.id)
    ))
    .limit(1)

  if (existing) return

  await db.insert(matches).values({
    userId,
    matchedUserId: admin.id,
  })
}

export const generateMatches = async (userId: number) => {
  // Cooldown check: find most recent non-admin match
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
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
    if (elapsed < MATCH_COOLDOWN_MS) {
      const nextMatchAt = new Date(recentMatch.createdAt.getTime() + MATCH_COOLDOWN_MS)
      return { error: 'cooldown' as const, nextMatchAt }
    }
  }

  const existingMatches = await db
    .select({ matchedUserId: matches.matchedUserId })
    .from(matches)
    .where(eq(matches.userId, userId))

  const excludeIds = [userId, ...existingMatches.map(m => m.matchedUserId)]

  // Select random candidates
  const candidates = await db
    .select()
    .from(users)
    .where(notInArray(users.id, excludeIds))
    .orderBy(sql`RANDOM()`)
    .limit(MATCHES_PER_ROUND)

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

  // Compute nextMatchAt from most recent non-admin match
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
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
    const nextTime = recentMatch.createdAt.getTime() + MATCH_COOLDOWN_MS
    if (nextTime > Date.now()) {
      nextMatchAt = new Date(nextTime)
    }
  }

  return { matches: userMatches, nextMatchAt }
}
