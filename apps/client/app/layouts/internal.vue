<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
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
  <div
    class="h-screen bg-background text-foreground grain overflow-hidden flex flex-col items-center justify-center"
  >
    <!-- App Container: fixed-size card -->
    <main
      class="w-full max-w-sm h-4/6 max-h-215 relative animate-in fade-in zoom-in-95 duration-700 grid grid-cols-1 grid-rows-1"
    >
      <div
        class="h-full overflow-hidden flex flex-col bg-card border shadow-sm rounded-xl"
      >
        <slot />
      </div>
    </main>

    <!-- Bottom Navigation -->
    <div
      class="mt-5 shrink-0 bg-card border shadow-sm rounded-full px-6 py-2 pt-3.5 flex items-center gap-6"
    >
      <NuxtLink
        to="/discover"
        class="text-primary/40 hover:text-primary transition-colors"
        active-class="!text-primary"
      >
        <Icon name="lucide:earth" size="22" />
      </NuxtLink>
      <NuxtLink
        to="/matches"
        class="text-primary/40 hover:text-primary transition-colors"
        active-class="!text-primary"
      >
        <Icon name="lucide:message-circle" size="22" />
      </NuxtLink>
      <NuxtLink
        to="/profile"
        class="text-primary/40 hover:text-primary transition-colors"
        active-class="!text-primary"
      >
        <Icon name="lucide:user" size="22" />
      </NuxtLink>
      <NuxtLink
        to="/settings"
        class="text-primary/40 hover:text-primary transition-colors"
        active-class="!text-primary"
      >
        <Icon name="lucide:settings" size="22" />
      </NuxtLink>
    </div>

    <Toaster position="top-center" />
  </div>
</template>
