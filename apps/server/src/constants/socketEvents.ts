export const SocketEvents = {
  // Client → Server
  JOIN: 'join',
  LEAVE: 'leave',
  SEND_MESSAGE: 'send_message',
  MARK_READ: 'mark_read',

  // Server → Client
  NEW_MESSAGE_FROM_MATCH: 'new_message_from_match',
  HAS_NEW_MESSAGE: 'has_new_message',
  MESSAGES_READ: 'messages_read',
  ERROR: 'error',
} as const
