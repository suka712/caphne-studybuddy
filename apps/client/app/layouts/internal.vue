<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'

const { isAuthenticated } = useAuth()
const { internalConnect, internalDisconnect } = useSocket()
const { attachListeners, requestBrowserPermission } = useChatNotifications()

onMounted(() => {
  if (isAuthenticated.value) {
    internalConnect()
    attachListeners()
    requestBrowserPermission()
  }
})

onUnmounted(() => {
  internalDisconnect()
})
</script>

<template>
  <div class="dark h-screen bg-background text-foreground">
    <main class="mx-auto">
      <slot />
    </main>
    <Toaster position="top-center"/>
  </div>
</template>
