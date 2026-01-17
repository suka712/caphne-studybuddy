import { Strategy as GitHubStrategy, Profile } from 'passport-github2'
import { env } from '../../config/env.js'
import { findOrCreateUser } from './google.strategy.js'

const CALLBACK_URL = '/api/auth/github/callback'

export const githubStrategy = new GitHubStrategy(
  {
    clientID: env.githubClientId,
    clientSecret: env.githubClientSecret,
    callbackURL: CALLBACK_URL,
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: Express.User) => void
  ) => {
    try {
      const user = await findOrCreateUser(profile as any, 'github')
      done(null, user)
    } catch (error) {
      done(error as Error)
    }
  }
)
