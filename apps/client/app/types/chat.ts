export interface ChatMessage {
  id: number
  matchId: number
  senderId: number
  content: string
  createdAt: string
  readAt: string | null
}
