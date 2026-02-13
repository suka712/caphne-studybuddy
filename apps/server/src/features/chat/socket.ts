import { Server as SocketIOServer } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { parse as parseCookie } from 'cookie'
import { verifyToken } from '../auth/jwt.service.js'
import { verifyMatchParticipant, createMessage, markMessagesRead } from './chat.services.js'
import { env } from '../../config/env.js'
import { db } from '../../db/db.js'
import { users } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

let ioInstance: SocketIOServer | null = null

// Maps userId to Set of socket IDs for online tracking
const onlineUsers = new Map<number, Set<string>>()

export function userIsOnline(userId: number) {
  const sockets = onlineUsers.get(userId)
  return sockets ? sockets.size > 0 : false
}

export function getIO(): SocketIOServer {
  if (!ioInstance) throw new Error('Socket.IO not initialized')
    return ioInstance
}

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  })

  ioInstance = io

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

    socket.join(`user:${userId}`)

    const sockets = onlineUsers.get(userId) ?? new Set()
    sockets.add(socket.id)
    onlineUsers.set(userId, sockets)

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

    socket.on('leave', (matchId: number) => {
      if (typeof matchId !== 'number') return
      socket.leave(`match:${matchId}`)
    })

    socket.on('mark_read', async (matchId: number) => {
      if (typeof matchId !== 'number') return
      const match = await verifyMatchParticipant(matchId, userId)
      if (!match) return
      
      const readCount = await markMessagesRead(matchId, userId)
      if (readCount > 0) {
        const senderId = match.userId === userId ? match.matchedUserId : match.userId
        io.to(`user:${senderId}`).emit('messages_read', { matchId })
      }
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
      io.to(`match:${matchId}`).emit('new_message_from_match', message)

      const recipientId = match.userId === userId ? match.matchedUserId : match.userId
      io.to(`user:${recipientId}`).emit('has_new_message', {
        matchId,
        messageId: message.id,
        senderId: userId,
        content: trimmed,
        createdAt: message.createdAt,
      })
    })

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId)
      if (sockets) {
        sockets.delete(socket.id)

        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          db.update(users)
            .set({ lastActiveAt: new Date() })
            .where(eq(users.id, userId))
            .catch((err) => console.error('Failed to update lastActiveAt:', err))
        }
      }
    })
  })

  return io
}
