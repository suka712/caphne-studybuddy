import { Router } from "express";
import { generateMatches, getAllMatches } from "./matches.services.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { User } from "../../db/schema.js";

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
    const result = await generateMatches(user.id)

    if ('error' in result) {
      res.status(429).json({ error: result.error, nextMatchAt: result.nextMatchAt })
      return
    }

    res.json({ match: result.match })
  } catch (e) {
    console.log(`Error generating new matches: ${e}`)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
