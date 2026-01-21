<template>
  <div class="flex justify-center items-center min-h-screen p-4">
    <Card class="w-full max-w-md">
      <CardContent class="pt-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Icon name="mdi:account" size="32" />
          </div>
          <div>
            <h1 class="text-xl font-bold">{{ editingUsername || user?.username }}</h1>
            <p class="text-muted-foreground text-sm">{{ user?.email }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="p-4 rounded-lg bg-muted space-y-3">
            <div>
              <label class="text-sm font-medium text-muted-foreground block mb-2">
                Username
              </label>
              <div v-if="!isEditingUsername" class="flex items-center justify-between">
                <p class="text-base">{{ user?.username }}</p>
                <Button variant="ghost" size="sm" @click="startEditingUsername" class="h-8 w-8 p-0"
                  title="Edit username">
                  <Icon name="mdi:pencil" size="16" />
                </Button>
              </div>
              <div v-else class="flex gap-2">
                <input ref="usernameInputRef" v-model="editingUsername" type="text" placeholder="Enter new username"
                  class="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  @keyup.enter="saveUsername" @keyup.escape="cancelEditingUsername" aria-label="Edit username" />
                <Button variant="default" size="sm" @click="saveUsername" class="h-9 px-3" title="Save username">
                  <Icon name="mdi:check" size="16" />
                </Button>
                <Button variant="outline" size="sm" @click="cancelEditingUsername" class="h-9 px-3"
                  title="Cancel editing">
                  <Icon name="mdi:close" size="16" />
                </Button>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-muted-foreground block mb-2">
                Email
              </label>
              <p class="text-base text-muted-foreground">{{ user?.email }}</p>
            </div>
          </div>

          <NuxtLink to="/start">
            <Button variant="default" class="w-full">
              <Icon name="ri:sparkling-2-fill" size="20" class="mr-2" />
              Get Started
            </Button>
          </NuxtLink>

          <Button variant="ghost" class="w-full text-muted-foreground hover:text-foreground mt-3" @click="handleLogout">
            <Icon name="mdi:logout" size="16" class="mr-2" />
            <span class="text-sm">Logout</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

definePageMeta({
  middleware: 'auth',
})

const { authUser: user, logout, updateProfile } = useAuth()

const isEditingUsername = ref(false)
const editingUsername = ref('')
const usernameInputRef = ref<HTMLInputElement | null>(null)

const startEditingUsername = () => {
  editingUsername.value = user.value?.username || ''
  isEditingUsername.value = true

  nextTick(() => {
    usernameInputRef.value?.focus()
  })
}

const saveUsername = async () => {
  const trimmedUsername = editingUsername.value.trim()

  if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 72) {
    console.error('Invalid username')
    return
  }

  try {
    await updateProfile({ username: trimmedUsername })
    isEditingUsername.value = false
    editingUsername.value = ''
  } catch (error) {
    console.error('Failed to update username:', error)
  }
}

const cancelEditingUsername = () => {
  isEditingUsername.value = false
  editingUsername.value = ''
}

const handleLogout = async () => {
  await logout()
  navigateTo('/')
}
</script>
