<template>
  <div class="flex justify-center items-center min-h-screen">
    <div v-if="isLoading" class="flex flex-col items-center">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
    </div>

    <Card v-else class="w-full max-w-xs">
      <CardContent>
        <div class="flex items-center gap-4 mb-6 justify-between">
          <div class="flex items-center gap-2">
            <div class="size-12 rounded-xl bg-muted flex items-center justify-center">
              <Icon name="mdi:account" size="32" />
            </div>
            <div class="overflow-hidden">
              <h1 class="text-xl font-bold">{{ profile.displayName }}</h1>
            </div>
          </div>
          <Button variant="outline" class="h-7 text-xs" :disabled="!canGenerate || isGenerating"
            @click="handleGenerate">
            <Icon v-if="isGenerating" name="svg-spinners:ring-resize" size="14" class="mr-1" />
            <span v-if="canGenerate && !isGenerating">New Match</span>
            <span v-else-if="isGenerating">Loading...</span>
            <span v-else>{{ cooldownText }}</span>
          </Button>
        </div>

        <div class="space-y-3">
          <p v-if="matches.length === 0" class="text-muted-foreground text-sm text-center py-4">
            No matches yet...
          </p>

          <div v-for="match in matches" :key="match.matchId" class="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div class="size-10 rounded-xl bg-background flex items-center justify-center shrink-0">
              <img v-if="match.photoUrl" :src="match.photoUrl" class="size-10 rounded-xl object-cover" />
              <Icon v-else name="mdi:account" size="24" />
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-semibold truncate">{{ match.displayName }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ match.major }} · {{ match.year }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <NuxtLink class="flex flex-1" to="/profile">
              <Button variant="outline" class="hover:text-foreground w-full">
                <Icon name="material-symbols:person" size="16"/>
                <span class="text-sm">Profile</span>
              </Button>
            </NuxtLink>
          </div>
        </div>
      </CardContent>
    </Card>
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
