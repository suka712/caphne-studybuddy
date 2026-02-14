<template>
  <div class="flex justify-center items-center min-h-screen">
    <div v-if="isCheckingProfile" class="flex flex-col items-center">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
    </div>

    <Card v-else-if="profile" class="w-full max-w-xs flex flex-col p-2 h-[42vh] min-h-80">
      <CardContent class="flex flex-col h-full p-0">
        <!-- Header -->
        <div class="flex items-center gap-3 p-4 border-b border-border">
          <div class="size-15 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-accent shrink-0">
            <img v-if="profile?.photoUrl" :src="profile?.photoUrl" class="w-full h-full object-cover">
            <Icon v-else name="material-symbols:person-heart-rounded" size="32" />
          </div>
          <div class="overflow-hidden">
            <h1 class="text-lg font-bold">{{ profile.displayName }}</h1>
            <p class="text-muted-foreground text-sm overflow-hidden">{{ authUser?.email }}</p>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-h-0 overflow-y-auto p-4">
          <div class="p-4 rounded-lg bg-muted space-y-3">
            <div>
              <label class="text-sm text-muted-foreground/80">Major</label>
              <p class="text-base">{{ profile.major }}</p>
            </div>

            <div>
              <label class="text-sm text-muted-foreground/80">Year</label>
              <p class="text-base">{{ profile.year }}</p>
            </div>

            <div v-if="profile.bio">
              <label class="text-sm text-muted-foreground/80">Bio</label>
              <p class="text-base">{{ profile.bio }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border">
          <div class="flex gap-2">
            <NuxtLink class="flex flex-1" to="/matches">
              <Button variant="outline" class="hover:text-foreground w-full">
                <Icon name="material-symbols:heart-smile" size="16" />
                <span class="text-sm">Matches</span>
              </Button>
            </NuxtLink>
            <NuxtLink to="/settings">
              <Button variant="outline" class="hover:text-foreground flex">
                <Icon name="material-symbols:settings-suggest-rounded" size="16"/>
              </Button>
            </NuxtLink>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: "internal"
})

const { authUser } = useAuth()
const { profile, fetchProfile, isCheckingProfile } = useProfile()

onMounted(() => {
  fetchProfile()
})
</script>
