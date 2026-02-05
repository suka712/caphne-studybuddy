import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { verifyMatchParticipant, getMessages } from './chat.services.js'
import { User } from '../../db/schema.js'

export const chatRouter = Router()

chatRouter.get('/:matchId/messages', requireAuth, async (req, res) => {
  const user = req.user as User
  const matchId = Number(req.params.matchId)

  if (isNaN(matchId)) {
    res.status(400).json({ error: 'Invalid match ID' })
    return
  }

  const match = await verifyMatchParticipant(matchId, user.id)
  if (!match) {
    res.status(403).json({ error: 'Not authorized to view this chat' })
    return
  }

  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const beforeId = req.query.before ? Number(req.query.before) : undefined

  try {
    const msgs = await getMessages(matchId, limit, beforeId)
    res.json({ messages: msgs })
  } catch (e) {
    console.error(`Error fetching messages for match ${matchId}:`, e)
    res.status(500).json({ error: 'Something went wrong' })
  }
})
