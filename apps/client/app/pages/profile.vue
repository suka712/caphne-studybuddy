<template>
  <div class="flex justify-center items-center min-h-screen">
    <div v-if="isCheckingProfile" class="flex flex-col items-center">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary" />
    </div>

    <Card v-else-if="profile" class="w-full max-w-xs flex flex-col p-2 h-[42vh] min-h-80">
      <CardContent class="flex flex-col h-full p-0">
        <div class="flex-1 p-4">
          <div class="flex items-center gap-3 mb-6">
            <div class="size-15 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-accent shrink-0">
              <img v-if="profile?.photoUrl" :src="profile?.photoUrl" class="w-full h-full object-cover">
              <Icon v-else name="material-symbols:person-heart-rounded" size="32" />
            </div>
            <div class="overflow-hidden">
              <h1 class="text-lg font-bold">{{ profile.displayName }}</h1>
              <p class="text-muted-foreground text-sm overflow-hidden">{{ authUser?.email }}</p>
            </div>
          </div>
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
        </div>

        <div class="p-4 border-t border-border">
          <div class="flex gap-2">
            <NuxtLink class="flex flex-1" to="/matches">
              <Button variant="outline" class="hover:text-foreground w-full">
                <Icon name="material-symbols:heart-smile" size="16" />
                <span class="text-sm">Matches</span>
              </Button>
            </NuxtLink>
            <Button variant="outline" class="hover:text-foreground flex" @click="handleLogout">
              <Icon name="streamline:emergency-exit-solid" size="16"/>
            </Button>
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
  layout: "internal"
})

const { authUser, logout } = useAuth()
const { profile, fetchProfile, updateProfile, isCheckingProfile } = useProfile() 

const isEditing = ref(false)
const editingName = ref('')

onMounted(async () => {
  try {
    await fetchProfile()
    console.log('Profile:', profile.value)
  } catch (e) {
    console.log('failed')
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
    await updateProfile({ displayName: trimmed})
    editingName.value = ''
    toast.success('Name updated')
  } catch (e) {
    toast.error('Failed to update name')
  } finally {
    isEditing.value = false
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
