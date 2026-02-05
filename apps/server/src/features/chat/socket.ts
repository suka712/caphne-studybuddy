import { Server as SocketIOServer } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { parse as parseCookie } from 'cookie'
import { verifyToken } from '../auth/jwt.service.js'
import { verifyMatchParticipant, createMessage } from './chat.services.js'
import { env } from '../../config/env.js'

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie
      if (!cookieHeader) return next(new Error('Authentication required'))

      const cookies = parseCookie(cookieHeader)
      const token = cookies.token
      if (!token) return next(new Error('Authentication required'))

      const payload = verifyToken(token)
      if (!payload) return next(new Error('Invalid or expired token'))

      socket.data.userId = payload.userId
      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const userId: number = socket.data.userId

    socket.on('join', async (matchId: number) => {
      if (typeof matchId !== 'number' || isNaN(matchId)) {
        socket.emit('error', { message: 'Invalid match ID' })
        return
      }

      const match = await verifyMatchParticipant(matchId, userId)
      if (!match) {
        socket.emit('error', { message: 'Not authorized for this chat' })
        return
      }

      socket.join(`match:${matchId}`)
    })

    socket.on('send_message', async (data: { matchId: number; content: string }) => {
      const { matchId, content } = data

      if (typeof matchId !== 'number' || typeof content !== 'string') {
        socket.emit('error', { message: 'Invalid message data' })
        return
      }

      const trimmed = content.trim()
      if (!trimmed || trimmed.length > 2000) {
        socket.emit('error', { message: 'Message must be 1-2000 characters' })
        return
      }

      const match = await verifyMatchParticipant(matchId, userId)
      if (!match) {
        socket.emit('error', { message: 'Not authorized for this chat' })
        return
      }

      const message = await createMessage(matchId, userId, trimmed)
      io.to(`match:${matchId}`).emit('new_message', message)
    })
  })

  return io
}
