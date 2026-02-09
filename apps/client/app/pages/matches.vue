<template>
  <div class="flex justify-center items-center min-h-screen">
    <div v-if="isLoading" class="flex flex-col items-center">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
    </div>

    <Card v-else class="w-full max-w-xs flex flex-col py-0" style="height: 40vh;">
      <CardContent class="flex flex-col h-full p-0">
        <!-- Header -->
        <div class="flex items-center p-4 justify-between border-b border-border">
          <div class="flex items-center gap-3 min-w-0">
            <div class="size-15 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-accent shrink-0">
              <img v-if="profile?.photoUrl" :src="profile?.photoUrl" class="w-full h-full object-cover">
              <Icon v-else name="material-symbols:person-heart-rounded" size="32" />
            </div>
            <h1 class="text-lg font-bold truncate">{{ profile.displayName }}</h1>
          </div>
          <Button variant="outline" class="h-7 text-xs shrink-0" :disabled="!canGenerate || isGenerating"
            @click="handleGenerate">
            <Icon v-if="isGenerating" name="svg-spinners:ring-resize" size="14" class="mr-1" />
            <span v-if="canGenerate && !isGenerating">New Match</span>
            <span v-else-if="isGenerating">Loading...</span>
            <span v-else>{{ cooldownText }}</span>
          </Button>
        </div>

        <!-- Matches List -->
        <ScrollArea class="flex-1 min-h-0">
          <div class="p-4 space-y-3">
            <p v-if="matches.length === 0" class="text-muted-foreground text-sm text-center py-4">
              No matches yet...
            </p>

            <NuxtLink v-for="match in matches" :key="match.matchId" :to="`/chat/${match.matchId}`"
              class="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
              <div class="size-10 rounded-xl bg-background flex items-center justify-center shrink-0">
                <img v-if="match.photoUrl" :src="match.photoUrl" class="size-10 rounded-xl object-cover" />
                <Icon v-else name="mdi:account" size="24" />
              </div>
              <div class="overflow-hidden flex-1">
                <p class="text-sm font-semibold truncate">{{ match.displayName }}</p>
                <p class="text-xs text-muted-foreground truncate">{{ match.major }} · {{ match.year }}</p>
              </div>
              <!-- Unread count badge -->
              <Badge v-if="getUnreadCount(match.matchId) > 0"
                class="size-5 p-0 text-[10px] flex items-center justify-center shrink-0">
                {{ getUnreadCount(match.matchId) }}
              </Badge>
            </NuxtLink>
          </div>
        </ScrollArea>

        <!-- Footer -->
        <div class="p-4 border-t border-border">
          <NuxtLink to="/profile">
            <Button variant="outline" class="hover:text-foreground w-full">
              <Icon name="material-symbols:person" size="16" />
              <span class="text-sm">Profile</span>
            </Button>
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '~/components/ui/badge'

definePageMeta({
  middleware: 'auth',
  layout: 'internal',
})

const { getSocket } = useSocket()
const { fetchUnreadCounts, getUnreadCount } = useChatNotifications()

const { public: { apiBase } } = useRuntimeConfig()

interface MatchCard {
  matchId: number
  displayName: string
  major: string
  year: string
  photoUrl: string | null
  matchedAt: string
}

const matches = ref<MatchCard[]>([])
const nextMatchAt = ref<Date | null>(null)
const isLoading = ref(true)
const isGenerating = ref(false)
const profile = ref<any>(null)


const canGenerate = computed(() => {
  if (!nextMatchAt.value) return true
  return new Date(nextMatchAt.value).getTime() <= Date.now()
})

const cooldownText = computed(() => {
  if (!nextMatchAt.value) return ''
  const diff = new Date(nextMatchAt.value).getTime() - Date.now()
  if (diff <= 0) return ''
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
})

let cooldownTimer: ReturnType<typeof setInterval>
onMounted(() => {
  cooldownTimer = setInterval(() => {
    if (nextMatchAt.value) {
      nextMatchAt.value = new Date(nextMatchAt.value)
    }
  }, 1_000)
})
onUnmounted(() => {
  clearInterval(cooldownTimer)
})

const fetchMatches = async () => {
  try {
    const data = await $fetch<{ matches: MatchCard[]; nextMatchAt: string | null }>(`${apiBase}/matches`, {
      credentials: 'include',
    })
    matches.value = data.matches
    nextMatchAt.value = data.nextMatchAt ? new Date(data.nextMatchAt) : null
  } catch (e) {
    console.error('Failed to fetch matches:', e)
    toast.error('Failed to load matches')
  }
}

onMounted(async () => {
  try {
    await fetchMatches()
    const data = await $fetch<{ profile: any }>(`${apiBase}/profile`, {
      credentials: 'include',
    })

    if (!data.profile) {
      navigateTo('/start')
      return
    }

    profile.value = data.profile
  } catch (e) {
    console.error('Failed to fetch profile:', e)
    navigateTo('/start')
  } finally {
    isLoading.value = false
  }

  await fetchUnreadCounts()

  const socket = getSocket()
  if (socket) {
    socket.on('has_new_message', (data: { matchId: number }) => {
      const idx = matches.value.findIndex(m => m.matchId === data.matchId)
      if (idx > 0) {
        const [match] = matches.value.splice(idx, 1)
        matches.value.unshift(match!)
      }
    })
  }
})

const handleGenerate = async () => {
  isGenerating.value = true
  try {
    const result = await $fetch<{ match: any }>(`${apiBase}/matches`, {
      method: 'POST',
      credentials: 'include',
    })
    await fetchMatches()
    if (result.match) {
      toast.success('New match found!')
    } else {
      toast.info('No more matches available right now')
    }
  } catch (e: any) {
    if (e?.response?.status === 429) {
      const body = e.response._data
      if (body?.nextMatchAt) {
        nextMatchAt.value = new Date(body.nextMatchAt)
      }
      toast.error('Please wait before generating new matches')
    } else {
      toast.error('Failed to generate matches')
    }
  } finally {
    isGenerating.value = false
  }
}
</script>
