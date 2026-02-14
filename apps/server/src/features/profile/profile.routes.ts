import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { db } from "../../db/db.js";
import { profiles } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { User } from "../../db/schema.js";
import { validateBody } from "../../middleware/validateBody.js"
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

  console.log(`User with ID ${authUser.id} fetched profile`)
  return res.json(profile || null)
})

const createProfileSchema = Type.Object({
  displayName: Type.String({ minLength: 1 }),
  gender: Type.String({ minLength: 1 }),
  birthday: Type.Optional(Type.Union([Type.String({ format: "date" }), Type.Null()])),
  year: Type.String({ minLength: 1, maxLength: 20 }),
  major: Type.String({ minLength: 1 }),
  bio: Type.Optional(Type.String()),
  photoUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  isPublic: Type.Boolean(),
  goals: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  vibes: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  interests: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
})

profileRouter.post('/', requireAuth, validateBody(createProfileSchema), async (req, res) => {
  const authUser = req.user as User
  const { displayName, gender, birthday, year, major, bio, photoUrl, isPublic, goals, vibes, interests } = req.body as Static<typeof createProfileSchema>

  let created
  try {
    [created] = await db.insert(profiles).values({
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
    }).returning()
  } catch (e) {
    if (e instanceof Error && 'code' in e || (e as any).code === '23505') {
      console.error(`Duplicate Error creating profile for user ID ${authUser.id}:`, e)
      return res.status(409).json({ message: 'Profile already exist' })
    }
    console.error(`Error creating profile for user ID ${authUser.id}:`, e)
    return res.status(500).json({ created: created })
  }

  console.log(`User with ID ${authUser.id} added profile`)
  return res.status(201).json(created)
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

  console.log(`User with ID ${authUser.id} updated profile`)
  return res.json(updated[0])
})
