import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './db/db.js'
import { emailCollection } from './db/schema.js'
import authRoute from "./auth/auth.route.js";

const app = express()
const PORT = process.env.PORT

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}))
app.use(express.json())
app.use("/api/auth/google", authRoute);



app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' })
})

app.post('/api/email-collection', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    await db.insert(emailCollection).values({ email })
    res.status(201).json({ message: 'Email collected' })
  } catch (e: any) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' })
    }
    res.status(500).json({ error: 'Failed to save email' })
  }
})

app.get('/health', (req, res) => {
  const uptimeSeconds = process.uptime()
  const hours = Math.floor(uptimeSeconds / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)
  const seconds = Math.floor(uptimeSeconds % 60)

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${hours}h ${minutes}m ${seconds}s`
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port`, PORT)
})