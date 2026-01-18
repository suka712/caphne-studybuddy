import { Router } from "express"
import { db } from "../../db/index.js"
import { emailCollection } from "../../db/schema.js"

export const emailRouter = Router()

emailRouter.post('/', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    await db.insert(emailCollection).values({ email })
    res.status(201).json({ message: 'Email collected' })
  } catch (e: any) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' })
    }
    res.status(500).json({ error: 'Failed to save email' })
  }
})