import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { db } from "../../db/db.js";
import { profiles } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { Profile, User } from "../../db/schema.js";

export const profileRouter = Router()

profileRouter.get('/', requireAuth, async (req, res) => {
  const authUser = req.user as User

  let profile
  try {
    [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, authUser.id))
      .limit(1)
  } catch (e) {
    console.error(`Error getting profile for user ID ${authUser.id}:`, e)
    return res.status(500).json({ message: 'Something went wrong' })
  }

  console.log(`User with ID ${authUser.id} fetched profile` )
  return res.json({ profile: profile || null })
})

profileRouter.post('/', requireAuth, async (req, res) => {
  const authUser = req.user as User
  const { displayName, gender, birthday, year, major, bio, photoUrl, isPublic, goals, vibes, interests } = req.body

  // TODO: VALIDATE ON THE LIBRARY PR

  try {
    await db.insert(profiles).values({
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
      interests,
    })
  } catch (e) {
    console.error(`Error creating profile for user ID ${authUser.id}:`, e)
    return res.status(500).json({ message: 'Something went wrong' })
  }

  console.log(`User with ID ${authUser.id} added profile` )
  return res.status(201).json({ success: true })
})

profileRouter.put('/', requireAuth, async (req, res) => {
  const authUser = req.user as User
  const updates = req.body

  let updated
  try {
    updated = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.userId, authUser.id))
      .returning()

    if (!updated.length) {
      return res.status(404).json({ message: 'Profile not found' })
    }
  } catch (e) {
    console.error(`Error updating profile for user ID ${authUser.id}:`, e)
    return res.status(500).json({ message: 'Something went wrong' })
  }

  console.log(`User with ID ${authUser.id} updated profile` )
  return res.json({ profile: updated[0] })
})
