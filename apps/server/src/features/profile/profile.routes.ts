import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { db } from "../../db/db.js";
import { profiles } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { User } from "../../db/schema.js";
import { validateBody } from "../../middleware/typebox.js"
import { Static, Type } from "typebox";

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

const createProfileSchema = Type.Object({
  displayName: Type.String(),
  gender: Type.String(),
  birthday: Type.String({ format: "date" }),
  year: Type.String({ minLength: 1, maxLength: 20 }),
  major: Type.String(),
  bio: Type.Optional(Type.String({ minLength: 1 })),
  photoUrl: Type.Optional(Type.String()),
  isPublic: Type.Optional(Type.Boolean()),
  goals: Type.Optional(Type.Array(Type.String())),
  vibes: Type.Optional(Type.Array(Type.String())),
  interests: Type.Optional(Type.Array(Type.String()))
})

profileRouter.post('/', requireAuth, validateBody(createProfileSchema) , async (req, res) => {
  const authUser = req.user as User
  const { displayName, gender, birthday, year, major, bio, photoUrl, isPublic, goals, vibes, interests } = req.body as Static<typeof createProfileSchema>

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

const updateProfileSchema = Type.Partial(createProfileSchema);

profileRouter.put('/', requireAuth, validateBody(updateProfileSchema), async (req, res) => {
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
