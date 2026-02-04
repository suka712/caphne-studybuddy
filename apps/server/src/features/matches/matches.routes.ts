import { Router } from "express";
import { generateNewMatch, getAllMatches } from "./matches.services.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { User } from "../../db/schema.js";

export const matchesRouter = Router()

matchesRouter.post('/', requireAuth, async (req, res) => {
  const user = req.user as User

  try {
    const match = await generateNewMatch(user.id)
    res.json({ match: match })
  } catch (e) {
    console.log(`Error generating new matches: ${e}`)
    res.json({ error: 'Something went wrong' })
  }
})

matchesRouter.get('/', requireAuth, async (req, res) => {
  const user = req.user as User

  try {
    const allMatches = await getAllMatches(user.id)
    res.json({matches: allMatches})
  } catch (e) {
    console.log(`Error getting all matches: ${e}`)
    res.json({ error: 'Something went wrong' })
  }
})