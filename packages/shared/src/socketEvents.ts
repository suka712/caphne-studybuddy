export const SocketEvents = {
  // Client to Server
  USER_JOINS_MATCH_ROOM: 'user_joins_match_room',
  USER_LEAVES_MATCH_ROOM: 'user_leaves_match_room',
  USER_SENDS_MESSAGE: 'user_sends_message',
  USER_MARKS_READ: 'user_marks_read',

  // Server to Client
  MATCH_ROOM_HAS_NEW_MESSAGE: 'match_room_has_new_message',
  USER_HAS_NEW_MESSAGE: 'user_has_new_message',
  MESSAGES_ARE_READ: 'messages_are_read',
  ERROR: 'error',
} as const
