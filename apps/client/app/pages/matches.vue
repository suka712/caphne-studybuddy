<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'internal'
})

const { public: { apiBase } } = useRuntimeConfig()
const { authUser } = useAuth()
const profile = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
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
</script>
<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="w-full max-w-xs">
      <CardContent>
        <div v-if="profile" class="flex items-center gap-4 mb-6">
          <div class="size-12 rounded-xl bg-muted flex items-center justify-center">
            <Icon name="mdi:account" size="32" />
          </div>
          <div class="overflow-hidden">
            <h1 class="text-xl font-bold">{{ profile.displayName }}</h1>
            <p class="text-muted-foreground text-sm overflow-hidden">{{ authUser?.email }}</p>
          </div>
        </div>
        <div v-else>
          Loading...
        </div>
        <div>
          Matches
        </div>
      </CardContent>
    </Card>
  </div>
</template>