<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
  layout: "internal"
})

const { authUser, logout } = useAuth()
const { isCheckingProfile, profile, fetchProfile, updateProfile } = useProfile()

onMounted(() => {
  fetchProfile()
})

// Editing state — tracks which field is being edited
const editingField = ref<'displayName' | 'photoUrl' | 'bio' | null>(null)
const editingValue = ref('')

const startEditing = (field: 'displayName' | 'photoUrl' | 'bio') => {
  editingField.value = field
  editingValue.value = profile.value?.[field] || ''
}

const cancelEditing = () => {
  editingField.value = null
  editingValue.value = ''
}

const validatePhotoUrl = async (url: string): Promise<boolean> => {
  if (!url.trim()) return true
  try {
    new URL(url)
  } catch {
    return false
  }
  const img = new Image()
  return new Promise((resolve) => {
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

const bioMaxLength = 200

const saveField = async () => {
  const field = editingField.value
  if (!field) return

  const value = editingValue.value.trim()

  if (field === 'displayName' && (!value || value.length < 2)) {
    toast.error('Name must be at least 2 characters')
    return
  }

  if (field === 'photoUrl' && value) {
    const isValid = await validatePhotoUrl(value)
    if (!isValid) {
      toast.error('Could not load image from this URL')
      return
    }
  }

  if (field === 'bio' && value.length > bioMaxLength) {
    toast.error(`Bio must be ${bioMaxLength} characters or less`)
    return
  }

  try {
    await updateProfile({ [field]: value || (field === 'photoUrl' ? null : '') })
    cancelEditing()
    toast.success('Updated')
  } catch {
    toast.error('Failed to update')
  }
}

const togglePublic = async (checked: boolean) => {
  try {
    await updateProfile({ isPublic: checked })
    toast.success(checked ? 'Profile is now public' : 'Profile is now private')
  } catch {
    toast.error('Failed to update visibility')
  }
}

const handleLogout = async () => {
  await logout()
  navigateTo('/')
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <div v-if="isCheckingProfile" class="flex flex-col items-center">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
    </div>

    <Card v-else-if="profile" class="w-full max-w-xs flex flex-col p-2 h-[42vh] min-h-80">
      <CardContent class="flex flex-col h-full p-0">
        <!-- Header -->
        <div class="flex items-center gap-3 p-4 border-b border-border">
          <div
            class="size-15 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-accent shrink-0">
            <img v-if="profile?.photoUrl" :src="profile?.photoUrl" class="w-full h-full object-cover">
            <Icon v-else name="material-symbols:person-heart-rounded" size="32" />
          </div>
          <div class="overflow-hidden">
            <h1 class="text-lg font-bold">{{ profile.displayName }}</h1>
            <p class="text-muted-foreground text-sm overflow-hidden">{{ authUser?.email }}</p>
          </div>
        </div>

        <!-- Editable Fields -->
        <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <!-- Display Name -->
          <div>
            <label class="text-sm text-muted-foreground/80">Display Name</label>
            <div v-if="editingField !== 'displayName'" class="flex items-center justify-between">
              <p class="text-base overflow-hidden">{{ profile.displayName }}</p>
              <Button variant="outline" class="size-7 p-0" @click="startEditing('displayName')" title="Edit name">
                <Icon name="mdi:pencil" size="18" />
              </Button>
            </div>
            <div v-else class="flex gap-1">
              <Input v-model="editingValue" type="text" placeholder="Enter new name"
                class="flex-1 h-7 border-input rounded-md bg-background" @keyup.enter="saveField"
                @keyup.escape="cancelEditing" />
              <Button variant="default" size="sm" @click="saveField" class="size-7 p-0" title="Save">
                <Icon name="mdi:check" size="16" />
              </Button>
              <Button variant="outline" size="sm" @click="cancelEditing" class="size-7 p-0" title="Cancel">
                <Icon name="mdi:close" size="16" />
              </Button>
            </div>
          </div>

          <!-- Photo URL -->
          <div>
            <label class="text-sm text-muted-foreground/80">Photo URL</label>
            <div v-if="editingField !== 'photoUrl'" class="flex items-center justify-between">
              <p class="text-base overflow-hidden truncate">{{ profile.photoUrl || 'Not set' }}</p>
              <Button variant="outline" class="size-7 p-0 shrink-0" @click="startEditing('photoUrl')" title="Edit photo URL">
                <Icon name="mdi:pencil" size="18" />
              </Button>
            </div>
            <div v-else class="space-y-1">
              <Textarea v-model="editingValue" placeholder="https://example.com/photo.jpg"
                class="min-h-16 text-sm bg-background" @keyup.escape="cancelEditing" />
              <div class="flex gap-1 justify-end">
                <Button variant="default" size="sm" @click="saveField" class="size-7 p-0" title="Save">
                  <Icon name="mdi:check" size="16" />
                </Button>
                <Button variant="outline" size="sm" @click="cancelEditing" class="size-7 p-0" title="Cancel">
                  <Icon name="mdi:close" size="16" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Bio -->
          <div>
            <div class="flex justify-between items-center">
              <label class="text-sm text-muted-foreground/80">Bio</label>
              <span v-if="editingField === 'bio'"
                :class="['text-xs', editingValue.length > bioMaxLength ? 'text-destructive' : 'text-muted-foreground']">
                {{ editingValue.length }}/{{ bioMaxLength }}
              </span>
            </div>
            <div v-if="editingField !== 'bio'" class="flex items-center justify-between">
              <p class="text-base overflow-hidden">{{ profile.bio || 'Not set' }}</p>
              <Button variant="outline" class="size-7 p-0 shrink-0" @click="startEditing('bio')" title="Edit bio">
                <Icon name="mdi:pencil" size="18" />
              </Button>
            </div>
            <div v-else class="space-y-1">
              <Textarea v-model="editingValue" placeholder="Tell others about yourself..."
                :rows="3" :maxlength="bioMaxLength" class="resize-none text-sm bg-background"
                @keyup.escape="cancelEditing" />
              <div class="flex gap-1 justify-end">
                <Button variant="default" size="sm" @click="saveField" class="size-7 p-0" title="Save">
                  <Icon name="mdi:check" size="16" />
                </Button>
                <Button variant="outline" size="sm" @click="cancelEditing" class="size-7 p-0" title="Cancel">
                  <Icon name="mdi:close" size="16" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Public Profile Toggle -->
          <div class="flex items-center justify-between pt-2">
            <div>
              <label class="text-sm text-muted-foreground/80">Public Profile</label>
            </div>
            <Switch :checked="profile.isPublic" @update:checked="togglePublic" />
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
            <Button variant="outline" class="hover:text-foreground flex" @click="handleLogout">
              <Icon name="streamline:emergency-exit-solid" size="16" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
