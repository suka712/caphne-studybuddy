import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { db } from "../../db/db.js";
import { profiles } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { User } from "../../db/schema.js";

export const profileRouter = Router()

profileRouter.get('/', requireAuth, async (req, res) => {
  const authUser = req.user as User

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, authUser.id))
    .limit(1)

  res.json({ profile: profile || null })
})

profileRouter.post('/', requireAuth, async (req, res) => {
  const authUser = req.user as User
  const { displayName, gender, birthday, year, major, bio, photoUrl, isPublic, goals, vibes, interests } = req.body

  // TODO: VALIDATE ON THE LIBRARY PR

  const newProfile = await db.insert(profiles).values({
    userId: authUser.id,
    displayName,
    gender,
    birthday,
    year,
    major,
    bio,
    photoUrl,
    isPublic,
    goals,
    vibes,
    interests
  }).returning()

  res.status(201).json({ profile: newProfile })
})

profileRouter.put('/', requireAuth, async (req, res) => {
  const authUser = req.user as User
  const updates = req.body

  const updated = await db
    .update(profiles)
    .set(updates)
    .where(eq(profiles.userId, authUser.id))
    .returning()

  if (!updated.length) {
    return res.status(404).json({ message: 'Profile not found' })
  }

  res.json({ profile: updated[0] })
})
