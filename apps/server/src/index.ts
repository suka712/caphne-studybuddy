import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { passport } from './features/auth/passport.js'
import { authRouter } from './features/auth/auth.routes.js'
import { env } from './config/env.js'
import { healthRouter } from './features/health/health.routes.js'
import { emailRouter } from './features/email/email.routes.js'

const app = express()

const allowedOrigins = env.corsOrigin.split(',').map(origin => origin.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use('/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/email-collection', emailRouter)

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`)
})
