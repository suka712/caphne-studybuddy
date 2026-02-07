import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
const isConnected = ref(false)

export const useSocket = () => {
  const { public: { apiBase } } = useRuntimeConfig()

  const internalConnect = () => {
    if (socket?.connected) return socket

    socket = io(apiBase, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socket.on('connect', () => {
      isConnected.value = true
    })

    socket.on('disconnect', () => {
      isConnected.value = false
    })

    return socket
  }

  const internalDisconnect = () => {
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
      isConnected.value = false
    }
  }

  const getSocket = () => socket

  return {
    internalConnect,
    internalDisconnect,
    getSocket,
    isConnected: readonly(isConnected),
  }
}