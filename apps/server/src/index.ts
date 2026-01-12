import express from 'express'

const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' })
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