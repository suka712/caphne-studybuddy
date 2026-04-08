import { Router } from "express";
import { generateMatch, getAllMatches } from "./matches.services.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { matches, User } from "../../db/schema.js";
import { db } from "../../db/db.js";
import { and, count, eq, gte } from "drizzle-orm";
import { matchConfig } from "../../config/matchConfig.js";

export const matchesRouter = Router()

matchesRouter.get('/', requireAuth, async (req, res) => {
  const user = req.user as User

  try {
    const result = await getAllMatches(user.id)
    res.json(result)
  } catch (e) {
    console.log(`Error getting all matches: ${e}`)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

matchesRouter.post('/', requireAuth, async (req, res) => {
  const user = req.user as User

  try {
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)

    const [ matchesToday ] = await db
      .select({ count: count()})
      .from(matches)
      .where(and(eq(matches.userId, user.id), gte(matches.createdAt, startOfDay)))

    if (matchesToday.count >= matchConfig.matchesPerDay) {
      return res.status(429).json({ error: 'You exceeded the match quota of today. Try again later'})
    }

    const newMatch = await generateMatch(user.id)

    res.json(newMatch)
  } catch (e) {
    console.log(`Error generating new matches: ${e}`)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
