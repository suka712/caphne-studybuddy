<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";

const { isAuthenticated } = useAuth();
const { internalConnect, internalDisconnect } = useSocket();
const { attachListeners, requestBrowserPermission } = useChatNotifications();
const stepNav = useStepNav();

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
      v-if="!stepNav"
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
        <Icon name="lucide:heart-handshake" size="22" />
      </NuxtLink>
      <NuxtLink
        to="/chat"
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

    <!-- Step Navigation (replaces the app nav during onboarding) -->
    <div
      v-else
      class="mt-5 shrink-0 w-full max-w-sm bg-card border shadow-sm rounded-full p-2.5 flex items-center gap-3"
    >
      <Button
        variant="outline"
        size="icon"
        class="h-11 w-11 rounded-full border-primary/10 shrink-0"
        :disabled="!stepNav.canGoBack || stepNav.isLoading"
        aria-label="Go back"
        @click="stepNav.onPrevious"
      >
        <Icon name="lucide:arrow-left" size="18" />
      </Button>
      <Button
        :disabled="stepNav.isLoading || !stepNav.canGoNext"
        class="flex-1 h-11 rounded-full font-black gap-2 hover:scale-[1.02] transition-transform active:scale-95"
        @click="stepNav.onNext"
      >
        <template v-if="stepNav.isLoading">
          <Icon name="svg-spinners:ring-resize" size="16" />
        </template>
        <template v-else>
          {{ stepNav.isLastStep ? "Finish" : "Next" }}
          <Icon
            :name="stepNav.isLastStep ? 'lucide:sparkles' : 'lucide:arrow-right'"
            size="16"
          />
        </template>
      </Button>
    </div>

    <Toaster position="top-center" />
  </div>
</template>
