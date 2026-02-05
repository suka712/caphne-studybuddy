<template>
  <div class="flex justify-center items-start min-h-screen py-8 px-4">
    <div v-if="isLoading" class="flex flex-col items-center mt-32">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
    </div>

    <div v-else class="w-full max-w-md space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Your Matches</h1>
        <Button
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <Icon v-if="isGenerating" name="svg-spinners:ring-resize" size="16" class="mr-2" />
          <span v-if="canGenerate && !isGenerating">Get New Matches</span>
          <span v-else-if="isGenerating">Generating...</span>
          <span v-else class="text-xs">{{ cooldownText }}</span>
        </Button>
      </div>

      <p v-if="matches.length === 0" class="text-muted-foreground text-sm text-center py-8">
        No matches yet. Tap "Get New Matches" to find study buddies!
      </p>

      <div class="space-y-3">
        <Card v-for="match in matches" :key="match.matchId">
          <CardContent class="flex items-center gap-4">
            <div class="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <img v-if="match.photoUrl" :src="match.photoUrl" class="size-12 rounded-xl object-cover" />
              <Icon v-else name="mdi:account" size="32" />
            </div>
            <div class="overflow-hidden">
              <p class="font-semibold truncate">{{ match.displayName }}</p>
              <div class="flex gap-2 mt-1">
                <Badge variant="secondary">{{ match.major }}</Badge>
                <Badge variant="outline">{{ match.year }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
  layout: 'internal',
})

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
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
})

// Refresh cooldownText every minute
let cooldownTimer: ReturnType<typeof setInterval>
onMounted(() => {
  cooldownTimer = setInterval(() => {
    // Trigger reactivity by reassigning
    if (nextMatchAt.value) {
      nextMatchAt.value = new Date(nextMatchAt.value)
    }
  }, 60_000)
})
onUnmounted(() => clearInterval(cooldownTimer))

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
  await fetchMatches()
  isLoading.value = false
})

const handleGenerate = async () => {
  isGenerating.value = true
  try {
    const data = await $fetch<{ matches?: MatchCard[]; error?: string; nextMatchAt?: string }>(`${apiBase}/matches`, {
      method: 'POST',
      credentials: 'include',
    })

    if (data.error === 'cooldown' && data.nextMatchAt) {
      nextMatchAt.value = new Date(data.nextMatchAt)
      toast.error('Please wait before generating new matches')
      return
    }

    await fetchMatches()
    toast.success('New matches found!')
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
