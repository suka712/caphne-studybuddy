import { db } from "../../db/db.js"
import { matches, users } from "../../db/schema.js"
import { ne, eq } from 'drizzle-orm'

export const generateNewMatch = async (userId: number) => {
  const [match] = await db
    .select()
    .from(users)
    .where(ne(users.id, userId))
    .limit(1)

  if (!match) {
    throw new Error(`no matches found`)
  }

  const [inserted] = await db
    .insert(matches)
    .values({
    userId: userId,
    matchedUserId: match.id
  }).returning()

  console.log(`Successfully selected 1 match: ${match}`)
  return inserted
}

export const getAllMatches = async (userId: number) => {
  const userMatches = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt
    })
    .from(matches)
    .innerJoin(users, eq(matches.matchedUserId, users.id))
    .where(eq(matches.userId, userId))

  return userMatches
}