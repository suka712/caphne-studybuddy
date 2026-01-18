import 'dotenv/config'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  port: requireEnv('PORT'),
  clientUrl: requireEnv('CLIENT_URL'),
  serverUrl: requireEnv('SERVER_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  googleClientId: requireEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
  githubClientId: requireEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: requireEnv('GITHUB_CLIENT_SECRET'),
} as const
