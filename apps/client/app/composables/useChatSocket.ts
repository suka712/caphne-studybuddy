import { toast } from 'vue-sonner'
import { SocketEvents } from '@caphne/shared/socket-events'
import type { ChatMessage } from '~/types/chat'

export const useChatSocket = (
  matchId: number,
  messages: Ref<ChatMessage[]>,
  currentUserId: ComputedRef<number | undefined>,
  scrollToBottom: () => void,
) => {
  const { getSocket, isConnected } = useSocket()
  const { clearUnread } = useChatNotifications()

  const setupListeners = () => {
    const socket = getSocket()
    if (!socket) return

    socket.on('connect', () => {
      socket.emit(SocketEvents.USER_JOINS_MATCH_ROOM, matchId)
      socket.emit(SocketEvents.USER_MARKS_READ, matchId)
    })

    if (socket.connected) {
      socket.emit(SocketEvents.USER_JOINS_MATCH_ROOM, matchId)
    }

    socket.emit(SocketEvents.USER_MARKS_READ, matchId)
    clearUnread(matchId)

    socket.on(SocketEvents.MATCH_ROOM_HAS_NEW_MESSAGE, (msg: ChatMessage) => {
      messages.value.push(msg)
      scrollToBottom()
      if (msg.senderId !== currentUserId.value) {
        socket.emit(SocketEvents.USER_MARKS_READ, matchId)
      }
    })

    socket.on(SocketEvents.ERROR, (err: { message: string }) => {
      toast.error(err.message)
    })

    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  const sendMessage = (content: string) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit(SocketEvents.USER_SENDS_MESSAGE, { matchId, content })
  }

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      const s = getSocket()
      if (s) s.emit(SocketEvents.USER_MARKS_READ, matchId)
    }
  }

  const cleanup = () => {
    const socket = getSocket()
    if (socket) {
      socket.emit(SocketEvents.USER_LEAVES_MATCH_ROOM, matchId)
      socket.off(SocketEvents.MATCH_ROOM_HAS_NEW_MESSAGE)
      socket.off(SocketEvents.ERROR)
      socket.off('connect')
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    isConnected,
    setupListeners,
    sendMessage,
    cleanup,
  }
}
