<script setup lang="ts">
import { useScrollNavbar } from "./../composables/useScrollNavbar";

const { showNavbar } = useScrollNavbar();
const mobileMenuOpen = ref(false);

const navLinks = [
  { label: "Stories", to: "/stories" },
  { label: "Events", to: "/events" },
  { label: "Friends", to: "/friends" },
  { label: "Support", to: "/support" },
];
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="[showNavbar ? 'py-3 translate-y-0' : 'py-5 -translate-y-2']"
  >
    <nav class="mx-auto max-w-7xl px-4">
      <div
        class="bg-card border shadow-sm rounded-full px-6 py-2.5 flex items-center justify-between transition-all duration-500"
        :class="
          showNavbar
            ? 'shadow-lg'
            : 'shadow-none bg-transparent border-transparent'
        "
      >
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <NuxtLink to="/" class="group flex items-center gap-2">
            <img
              src="/favicon.svg"
              alt="Caphne"
              class="size-9 transition-transform group-hover:scale-110 group-hover:rotate-6"
            />
            <span class="text-xl font-black tracking-tighter">caphne.</span>
          </NuxtLink>
        </div>

        <!-- Desktop Nav -->
        <div
          class="hidden md:flex items-center gap-1 bg-primary/5 p-1 rounded-2xl border border-primary/5"
        >
          <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to">
            <Button
              variant="ghost"
              class="rounded-xl px-5 h-9 text-sm font-extrabold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {{ link.label }}
            </Button>
          </NuxtLink>
        </div>

        <!-- Desktop Right -->
        <div class="hidden md:flex items-center gap-3">
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-10 w-10 rounded-xl bg-primary/5 hover:bg-primary/10 border-none transition-colors flex items-center justify-center"
              >
                <Icon name="lucide:globe" size="18" class="text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-2 w-[160px] rounded-2xl mt-2" align="end">
              <div class="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  class="justify-between h-10 rounded-lg px-3 font-extrabold"
                >
                  English
                  <Icon name="lucide:check" size="14" class="text-accent" />
                </Button>
                <Button
                  variant="ghost"
                  class="justify-start h-10 rounded-lg px-3 font-extrabold opacity-50"
                >
                  Vietnamese
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <NuxtLink to="/start">
            <Button
              class="rounded-xl px-6 h-10 font-black shadow-lg shadow-primary/10 hover:scale-105 transition-transform active:scale-95"
            >
              Start Now
            </Button>
          </NuxtLink>
        </div>

        <!-- Mobile Toggle -->
        <div class="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            class="rounded-xl"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Icon v-if="mobileMenuOpen" name="lucide:x" size="24" />
            <Icon v-else name="lucide:menu" size="24" />
          </Button>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="mobileMenuOpen" class="md:hidden px-4 mt-2">
        <div
          class="bg-card border rounded-[2.5rem] p-6 flex flex-col gap-2 shadow-2xl"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="w-full"
            @click="mobileMenuOpen = false"
          >
            <Button
              variant="ghost"
              class="w-full justify-start h-14 text-lg font-black rounded-xl px-6"
            >
              {{ link.label }}
            </Button>
          </NuxtLink>
          <div class="h-px bg-primary/10 my-4" />
          <div class="flex items-center justify-between px-6 mb-4">
            <span
              class="text-sm font-black uppercase tracking-widest text-muted-foreground"
              >Language</span
            >
            <div class="flex gap-2">
              <Button
                variant="default"
                size="sm"
                class="rounded-lg h-9 font-black"
                >EN</Button
              >
              <Button
                variant="outline"
                size="sm"
                class="rounded-lg h-9 font-black"
                >VN</Button
              >
            </div>
          </div>
          <NuxtLink to="/start" @click="mobileMenuOpen = false">
            <Button
              class="w-full h-16 rounded-2xl text-lg font-black shadow-xl"
            >
              Start Now
            </Button>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
