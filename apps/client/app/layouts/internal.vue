<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'

const { isAuthenticated } = useAuth()
const { connect, disconnect } = useSocket()

onMounted(() => {
  if (isAuthenticated.value) {
    connect()
  }
})

onUnmounted(() => {
  disconnect()
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
