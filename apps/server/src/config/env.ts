import 'dotenv/config'

function requireEnv(key: string): string {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Missing required environment variables: ${key}`)
    }
    return value
}

export const env = {
    port: process.env.PORT || '7070',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    jwtSecret: requireEnv('JWT_SECRET'),
    google: {
        clientId: requireEnv('GOOGLE_CLIENT_ID'),
        clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
        callbackUrl: 'api/auth/google/callback',
    },
    github: {
        clientId: requireEnv('GITHUB_CLIENT_ID'),
        clientSecret: requireEnv('GITHUB_CLIENT_SECRET'),
        callbackUrl: 'api/auth/github/callback',
    },
} as const