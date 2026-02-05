import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { passport } from './features/auth/passport.js'
import { authRouter } from './features/auth/auth.routes.js'
import { env } from './config/env.js'
import { healthRouter } from './features/health/health.routes.js'
import { emailRouter } from './features/email/email.routes.js'
import { profileRouter } from './features/profile/profile.routes.js'
import { matchesRouter } from './features/matches/matches.routes.js'
import { chatRouter } from './features/chat/chat.routes.js'
import { setupSocketIO } from './features/chat/socket.js'

const app = express()

app.use(cors({
  origin: env.clientUrl,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/email-collection', emailRouter)
app.use('/profile', profileRouter)
app.use('/matches', matchesRouter)
app.use('/chat', chatRouter)

const server = createServer(app)
setupSocketIO(server)

server.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`)
})
