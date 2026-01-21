import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { db } from "../../db/db.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { User } from "../../db/schema.js";

const profileRouter = Router()

profileRouter.put('/', requireAuth, async (req, res) => {
  try {
    const authUser = req.user as User
    const { username } = req.body

    // Input validation
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Username is required' })
    }

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' })
    }

    if (trimmedUsername.length > 72) {
      return res.status(400).json({ message: 'Username must be less than 72 characters' })
    }

    const updatedUser = await db
      .update(users)
      .set({ username: trimmedUsername })
      .where(eq(users.id, authUser.id))
      .returning()

    if (!updatedUser.length) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { password, createdAt, googleId, githubId, ...safeUser } = updatedUser[0]
    res.json({ user: safeUser })
  } catch (error) {
    console.error('Profile updated error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

export { profileRouter }