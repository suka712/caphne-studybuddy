<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";

const { isAuthenticated } = useAuth();
const { internalConnect, internalDisconnect } = useSocket();
const { attachListeners, requestBrowserPermission } = useChatNotifications();

onMounted(() => {
  if (isAuthenticated.value) {
    internalConnect();
    attachListeners();
    requestBrowserPermission();
  }
});

onUnmounted(() => {
  internalDisconnect();
});
</script>

<template>
  <div class="h-screen bg-background text-foreground grain overflow-hidden">
    <div class="fixed inset-0 -z-10 dot-grid pointer-events-none" />
    <main class="mx-auto h-full relative">
      <slot />
    </main>
    <Toaster position="top-center" />
  </div>
</template>
