import { db } from "../../db/db.js"
import { matches, users } from "../../db/schema.js"
import { ne, eq } from 'drizzle-orm'

export const generateNewMatch = async (userId: number) => {
  const [match] = await db
    .select()
    .from(users)
    .limit(1)
    .where(ne(users.id, userId))

  if (!match) {
    throw new Error(`no matches found`)
  }

  await db.insert(matches).values({
    userId: userId,
    matchedUserId: match.id
  })

  console.log(`Successfully selected 1 match: ${match}`)
  return match
}