import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useSocket = () => {
  const { public: { apiBase } } = useRuntimeConfig()

  const connect = () => {
    if (socket?.connected) return socket

    socket = io(apiBase, {
      withCredentials: true,
    })

    return socket
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  const getSocket = () => socket

  return { connect, disconnect, getSocket }
}
