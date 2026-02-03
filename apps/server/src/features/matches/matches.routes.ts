import { Router } from "express";
import { generateNewMatch } from "./matches.services.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { User } from "../../db/schema.js";

export const matchesRouter = Router()

matchesRouter.get('/new', requireAuth, async (req, res) => {
  const user = req.user as User

  try {
    const match = await generateNewMatch(user.id)
    res.json({ match: match })
  } catch (e) {
    console.log(`Error getting new matches: ${e}`)
    res.json({ error: 'Something went wrong' })
  }
})

matchesRouter.get('/all', requireAuth, async (req, res) => {
  const user = req.user as User

  try {
    
  } catch (e) {
    console.log(`Error getting all matches: ${e}`)
    res.json({ error: 'Something went wrong' })
  }
})