import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { env } from '../../config/env.js'

const CALLBACK_URL = '/api/auth/google/callback'

export const googleStrategy = new GoogleStrategy(
  {
    clientID: env.googleClientId,
    clientSecret: env.googleClientSecret,
    callbackURL: CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'google')
      done(null, user)
    } catch (error) {
      done(error as Error)
    }
  }
)

async function findOrCreateUser(profile: Profile, provider: 'google' | 'github') {
  const providerId = profile.id
  const email = profile.emails?.[0]?.value
  const username = profile.displayName || email?.split('@')[0] || 'user'

  if (!email) {
    throw new Error('Email not provided by OAuth provider')
  }

  const [existingByProvider] = await db
    .select()
    .from(users)
    .where(
      provider === 'google'
        ? eq(users.googleId, providerId)
        : eq(users.githubId, providerId)
    )
    .limit(1)

  if (existingByProvider) {
    return existingByProvider
  }

  const [existingByEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingByEmail) {
    const [updated] = await db
      .update(users)
      .set(provider === 'google' ? { googleId: providerId } : { githubId: providerId })
      .where(eq(users.id, existingByEmail.id))
      .returning()
    return updated
  }

  const [newUser] = await db
    .insert(users)
    .values({
      username,
      email,
      ...(provider === 'google' ? { googleId: providerId } : { githubId: providerId }),
    })
    .returning()

  return newUser
}

export { findOrCreateUser }
