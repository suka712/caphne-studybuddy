<template>
  <div class="flex justify-center items-center min-h-screen">
    <div v-if="isLoading" class="flex flex-col items-center">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
    </div>

    <Card v-else-if="profile" class="w-full max-w-xs">
      <CardContent>
        <div class="flex items-center gap-4 mb-6">
          <div class="size-12 rounded-xl bg-muted flex items-center justify-center">
            <Icon name="mdi:account" size="32" />
          </div>
          <div class="overflow-hidden">
            <h1 class="text-xl font-bold">{{ profile.displayName }}</h1>
            <p class="text-muted-foreground text-sm overflow-hidden">{{ authUser?.email }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="p-4 rounded-lg bg-muted space-y-3">
            <div>
              <label class="text-sm text-muted-foreground/80">Display Name</label>
              <div v-if="!isEditing" class="flex items-center justify-between">
                <p class="text-base overflow-hidden">{{ profile.displayName }}</p>
                <Button variant="outline" class="size-7 p-0" @click="startEditing" title="Edit name">
                  <Icon name="mdi:pencil" size="18" />
                </Button>
              </div>
              <div v-else class="flex gap-1">
                <Input v-model="editingName" type="text" placeholder="Enter new name"
                  class="flex-1 h-7 border-input rounded-md bg-background" @keyup.enter="saveName"
                  @keyup.escape="cancelEditing" />
                <Button variant="default" size="sm" @click="saveName" class="size-7 p-0" title="Save">
                  <Icon name="mdi:check" size="16" />
                </Button>
                <Button variant="outline" size="sm" @click="cancelEditing" class="size-7 p-0" title="Cancel">
                  <Icon name="mdi:close" size="16" />
                </Button>
              </div>
            </div>

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

          <Button variant="outline" class="w-full hover:text-foreground" @click="handleLogout">
            <Icon name="mdi:logout" size="16" class="mr-2" />
            <span class="text-sm">Logout</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
  layout: "internal"
})

const { public: { apiBase } } = useRuntimeConfig()
const { authUser, logout } = useAuth()

const isLoading = ref(true)
const profile = ref<any>(null)

const isEditing = ref(false)
const editingName = ref('')

onMounted(async () => {
  try {
    const data = await $fetch<{ profile: any }>(`${apiBase}/api/profile`, {
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

const startEditing = () => {
  editingName.value = profile.value?.displayName || ''
  isEditing.value = true
}

const saveName = async () => {
  const trimmed = editingName.value.trim()
  if (!trimmed || trimmed.length < 2) {
    toast.error('Name must be at least 2 characters')
    return
  }

  try {
    const data = await $fetch<{ profile: any }>(`${apiBase}/api/profile`, {
      method: 'PUT',
      credentials: 'include',
      body: { displayName: trimmed }
    })
    profile.value = data.profile
    isEditing.value = false
    editingName.value = ''
    toast.success('Name updated')
  } catch (e) {
    toast.error('Failed to update name')
  }
}

const cancelEditing = () => {
  isEditing.value = false
  editingName.value = ''
}

const handleLogout = async () => {
  await logout()
  navigateTo('/')
}
</script>
