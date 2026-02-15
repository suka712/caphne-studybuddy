<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="w-full max-w-xs flex flex-col h-[45vh] min-h-96 p-2">
      <CardContent class="flex flex-col h-full p-0">
        <!-- Header -->
        <div class="flex items-center gap-2 border-b border-border py-2 pl-2">
          <NuxtLink to="/matches">
            <Button variant="ghost" size="sm" class="size-8 p-0">
              <Icon name="mdi:arrow-left" size="20" />
            </Button>
          </NuxtLink>
          <!-- Status line -->
          <div class="min-w-0">
            <p class="text-sm font-semibold truncate">{{ matchDisplayName }}</p>
            <p v-if="isMatchOnline" class="text-[11px] text-green-500">Online</p>
            <p v-else-if="matchLastActiveAt" class="text-[11px] text-muted-foreground">
              Active {{ timeAgo(matchLastActiveAt) }}
            </p>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
        </div>
        <ScrollArea v-else ref="scrollAreaRef" class="flex-1 min-h-0">
          <div class="p-4 space-y-2">
            <Button v-if="hasMore" variant="ghost" size="sm" class="w-full text-xs text-muted-foreground"
              :disabled="isLoadingMore" @click="loadMore">
              {{ isLoadingMore ? 'Loading...' : 'Load older messages' }}
            </Button>

            <p v-if="messages.length === 0 && !hasMore" class="text-muted-foreground text-sm text-center py-4">
              No messages yet. Say hi!
            </p>

            <div v-for="msg in messages" :key="msg.id" :class="[
              'max-w-[80%] rounded-lg px-3 py-2 text-sm wrap-break-word',
              msg.senderId === currentUserId
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'mr-auto bg-muted'
            ]">
              <p>{{ msg.content }}</p>
              <p class="text-[10px] opacity-60 mt-1">
                {{ formatTime(msg.createdAt) }}
              </p>
            </div>
          </div>
        </ScrollArea>

        <!-- Input -->
        <div class="p-4 border-t border-border">
          <form @submit.prevent="sendMessage" class="flex gap-2 h-full">
            <Input v-model="newMessage" placeholder="Type a message..." class="flex-1" :disabled="!isConnected" />
            <Button type="submit" size="sm" class="h-full" :disabled="!canSend">
              <Icon name="mingcute:send-fill" size="18" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SocketEvents } from '~/constants/socketEvents'

definePageMeta({
  middleware: 'auth',
  layout: 'internal',
})

const route = useRoute()
const { public: { apiBase } } = useRuntimeConfig()
const { authUser } = useAuth()
const { getSocket } = useSocket()
const { clearUnread } = useChatNotifications()

const matchId = Number(route.params.matchId)
const currentUserId = computed(() => authUser.value?.id)

interface ChatMessage {
  id: number
  matchId: number
  senderId: number
  content: string
  createdAt: string
  readAt: string | null
}

const messages = ref<ChatMessage[]>([])
const matchDisplayName = ref('')
const newMessage = ref('')
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isConnected = ref(false)
const hasMore = ref(true)
const scrollAreaRef = ref<InstanceType<typeof ScrollArea> | null>(null)
const isMatchOnline = ref(false)
const matchLastActiveAt = ref<string | null>(null)

const canSend = computed(() =>
  isConnected.value && newMessage.value.trim().length > 0
)

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    const viewport = scrollAreaRef.value?.$el?.querySelector('[data-slot="scroll-area-viewport"]')
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  })
}

const PAGE_SIZE = 50

const fetchMessages = async (beforeId?: number) => {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
  if (beforeId) params.set('before', String(beforeId))

  const data = await $fetch<{ messages: ChatMessage[] }>(
    `${apiBase}/chat/${matchId}/messages?${params}`,
    { credentials: 'include' }
  )
  return data.messages
}

const loadMore = async () => {
  if (!hasMore.value || messages.value.length === 0) return
  isLoadingMore.value = true
  try {
    const oldestId = messages.value[0]!.id
    const older = await fetchMessages(oldestId)
    if (older.length < PAGE_SIZE) hasMore.value = false
    messages.value = [...older, ...messages.value]
  } catch {
    toast.error('Failed to load older messages')
  } finally {
    isLoadingMore.value = false
  }
}

const sendMessage = () => {
  const content = newMessage.value.trim()
  if (!content) return

  const socket = getSocket()
  if (!socket) return

  socket.emit(SocketEvents.SEND_MESSAGE, { matchId, content })
  newMessage.value = ''
}

onMounted(async () => {
  try {
    const matchesData = await $fetch<{ matches: any[] }>(
      `${apiBase}/matches`,
      { credentials: 'include' }
    )
    const thisMatch = matchesData.matches.find((m: any) => m.matchId === matchId)
    if (!thisMatch) {
      toast.error('Match not found')
      navigateTo('/matches')
      return
    }
    matchDisplayName.value = thisMatch.displayName
    isMatchOnline.value = thisMatch.isOnline
    matchLastActiveAt.value = thisMatch.lastActiveAt

    const initialMessages = await fetchMessages()
    messages.value = initialMessages
    if (initialMessages.length < PAGE_SIZE) hasMore.value = false
    isLoading.value = false
    scrollToBottom()

    const socket = getSocket()
    if (!socket) return

    socket.on('connect', () => {
      isConnected.value = true
      socket.emit(SocketEvents.JOIN, matchId)
      socket.emit(SocketEvents.MARK_READ, matchId)
    })

    if (socket.connected) {
      isConnected.value = true
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

    socket.on('disconnect', () => {
      isConnected.value = false
    })

    document.addEventListener('visibilitychange', handleVisibilityChange)
  } catch (e) {
    console.error('Failed to initialize chat:', e)
    toast.error('Failed to load chat')
    navigateTo('/matches')
  } finally {
    isLoading.value = false
  }
})

const handleVisibilityChange = () => {
  if (!document.hidden) {
    const s = getSocket()
    if (s) s.emit(SocketEvents.MARK_READ, matchId)
  }
}

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.emit(SocketEvents.LEAVE, matchId)
    socket.off(SocketEvents.NEW_MESSAGE_FROM_MATCH)
    socket.off(SocketEvents.ERROR)
    socket.off('connect')
    socket.off('disconnect')
  }
})
</script>