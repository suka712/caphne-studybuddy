import { toast } from 'vue-sonner'
import { SocketEvents } from '~/constants/socketEvents'

interface ChatMessage {
  id: number
  matchId: number
  senderId: number
  content: string
  createdAt: string
  readAt: string | null
}

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
      socket.emit(SocketEvents.JOIN, matchId)
      socket.emit(SocketEvents.MARK_READ, matchId)
    })

    if (socket.connected) {
      socket.emit(SocketEvents.JOIN, matchId)
    }

    socket.emit(SocketEvents.MARK_READ, matchId)
    clearUnread(matchId)

    socket.on(SocketEvents.NEW_MESSAGE_FROM_MATCH, (msg: ChatMessage) => {
      messages.value.push(msg)
      scrollToBottom()
      if (msg.senderId !== currentUserId.value) {
        socket.emit(SocketEvents.MARK_READ, matchId)
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
    socket.emit(SocketEvents.SEND_MESSAGE, { matchId, content })
  }

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      const s = getSocket()
      if (s) s.emit(SocketEvents.MARK_READ, matchId)
    }
  }

  const cleanup = () => {
    const socket = getSocket()
    if (socket) {
      socket.emit(SocketEvents.LEAVE, matchId)
      socket.off(SocketEvents.NEW_MESSAGE_FROM_MATCH)
      socket.off(SocketEvents.ERROR)
      socket.off('connect')
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    isConnected: readonly(isConnected),
    setupListeners,
    sendMessage,
    cleanup,
  }
}
