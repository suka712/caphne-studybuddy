<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="w-full max-w-xs">
      <CardContent>
        <div class="flex items-center gap-4 mb-6">
          <div class="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Icon name="mdi:account" size="32" />
          </div>
          <div class="overflow-hidden">
            <h1 class="text-xl font-bold truncate">
              {{ isEditingUsername ? editingUsername : user?.username }}
            </h1>
            <p class="text-muted-foreground text-sm truncate">{{ user?.email }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="p-4 rounded-lg bg-muted space-y-3">
            <div>
              <label class="text-sm text-muted-foreground/80 block mb-1">Username</label>

              <div v-if="!isEditingUsername" class="flex items-center justify-between h-9">
                <p class="text-base font-medium">{{ user?.username }}</p>
                <Button variant="ghost" size="icon" class="size-7" @click="startEditingUsername" title="Edit username">
                  <Icon name="mdi:pencil" size="18" />
                </Button>
              </div>

              <div v-else>
                <div class="flex gap-2 h-9">
                  <Input ref="usernameInputRef" v-model="editingUsername" type="text" class="flex-1 bg-background"
                    :disabled="isSubmitting" @keyup.enter="saveUsername" @keyup.escape="cancelEditingUsername" />
                  <Button variant="default" size="icon" class="size-9 shrink-0" @click="saveUsername"
                    :disabled="isSubmitting">
                    <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" size="16" />
                    <Icon v-else name="mdi:check" size="16" />
                  </Button>
                  <Button variant="outline" size="icon" class="size-9 shrink-0" @click="cancelEditingUsername"
                    :disabled="isSubmitting">
                    <Icon name="mdi:close" size="16" />
                  </Button>
                </div>
                <p v-if="errorMessage" class="text-xs text-destructive mt-1.5">{{ errorMessage }}</p>
              </div>
            </div>

            <div>
              <label class="text-sm text-muted-foreground/80 block mb-1">Email</label>
              <p class="text-base h-9 flex items-center">{{ user?.email }}</p>
            </div>
          </div>

          <NuxtLink to="/start" class="block">
            <Button variant="default" class="w-full">
              <Icon name="ri:sparkling-2-fill" size="20" class="mr-2" />
              Get Started
            </Button>
          </NuxtLink>

          <Button variant="outline" class="w-full text-muted-foreground hover:text-destructive" @click="handleLogout">
            <Icon name="mdi:logout" size="16" class="mr-2" />
            <span class="text-sm">Logout</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, type ComponentPublicInstance } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: "internal"
})

const { authUser: user, logout, updateProfile } = useAuth()

const isEditingUsername = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const editingUsername = ref('')

const usernameInputRef = ref<ComponentPublicInstance | null>(null)

const startEditingUsername = async () => {
  editingUsername.value = user.value?.username || ''
  isEditingUsername.value = true
  errorMessage.value = ''

  await nextTick()
  const inputElement = usernameInputRef.value?.$el as HTMLInputElement
  inputElement?.focus()
}

const saveUsername = async () => {
  errorMessage.value = ''
  const trimmedUsername = editingUsername.value.trim()

  if (!trimmedUsername || trimmedUsername.length < 3) {
    errorMessage.value = 'Username must be at least 3 characters'
    return
  }

  try {
    isSubmitting.value = true
    await updateProfile({ username: trimmedUsername })
    isEditingUsername.value = false
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Update failed'
  } finally {
    isSubmitting.value = false
  }
}

const cancelEditingUsername = () => {
  isEditingUsername.value = false
  errorMessage.value = ''
}

const handleLogout = async () => {
  await logout()
  await navigateTo('/')
}
</script>