<script setup lang="ts">
import { majorOptions, yearOptions, goalOptions, vibeOptions } from "~/data/profileOptions";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

const { authUser } = useAuth();
const { profile, isCheckingProfile } = useProfile();

const {
  public: { apiBase },
} = useRuntimeConfig();

const [matchCount, publicProfileCount, chatCount] = await Promise.all([
  $fetch<{ matchCount: number }>(`${apiBase}/matches/count`, {
    method: "GET",
    credentials: "include",
  }),
  $fetch<{ publicProfiles: number }>(`${apiBase}/discover/count`, {
    method: "GET",
    credentials: "include",
  }),
  $fetch<{ chats: number }>(`${apiBase}/chat/count`, {
    method: "GET",
    credentials: "include",
  }),
]);

const stats = computed(() => [
  {
    label: "Public Profiles",
    value: publicProfileCount.publicProfiles,
    class: "bg-secondary/30 border-primary/5",
    to: "/discover",
    icon: "lucide:compass",
  },
  {
    label: "Matches",
    value: matchCount.matchCount,
    class: "bg-accent/10 border-accent/20",
    to: "/matches",
    icon: "lucide:heart",
  },
  {
    label: "Chats",
    value: chatCount.chats,
    class: "bg-secondary/30 border-primary/5",
    to: "/chat",
    icon: "lucide:message-circle",
  },
]);

const majorLabel = (value: string) =>
  majorOptions.flatMap((g) => g.items).find((i) => i.value === value)?.label ??
  value;

const yearLabel = (value: string) =>
  yearOptions.find((y) => y.value === value)?.label ?? value;

const goalLabel = (id: string) =>
  goalOptions.find((g) => g.id === id)?.label ?? id;
</script>

<template>
  <div class="h-full">
    <div v-if="isCheckingProfile" class="flex items-center justify-center h-full">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
    </div>

    <div v-else-if="profile" class="h-full flex flex-col">
      <!-- Header -->
      <div class="shrink-0 p-8 pb-6 flex flex-col items-center text-center gap-4">
        <NuxtLink
          to="/settings"
          class="group relative size-24 rounded-full bg-secondary/40 flex items-center justify-center overflow-hidden shadow-xl"
        >
          <img
            v-if="profile?.photoUrl"
            :src="profile.photoUrl"
            class="w-full h-full object-cover"
          />
          <Icon
            v-else
            name="lucide:user"
            size="40"
            class="text-muted-foreground/50"
          />
          <div
            class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="lucide:pencil" size="18" class="text-white" />
            <span class="text-[10px] font-black uppercase tracking-widest text-white"
              >Edit</span
            >
          </div>
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-black tracking-tight text-primary">
            {{ profile.displayName }}
          </h1>
          <p class="text-sm font-bold text-muted-foreground">
            {{ authUser?.email }}
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-h-0 overflow-y-auto px-6 pb-8 space-y-6">
        <div
          class="p-6 rounded-2xl bg-secondary/30 border border-primary/5 space-y-5"
        >
          <div class="grid grid-cols-2 gap-5">
            <div class="space-y-1">
              <label
                class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
                >Major</label
              >
              <p class="text-lg font-bold text-primary">
                {{ majorLabel(profile.major) }}
              </p>
            </div>

            <div class="space-y-1">
              <label
                class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
                >Year</label
              >
              <p class="text-lg font-bold text-primary">
                {{ yearLabel(profile.year) }}
              </p>
            </div>
          </div>

          <div v-if="profile.bio" class="space-y-1">
            <label
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
              >Bio</label
            >
            <p class="text-sm font-medium leading-relaxed text-muted-foreground">
              {{ profile.bio }}
            </p>
          </div>

          <div v-if="profile.goals.length > 0" class="space-y-1.5">
            <label
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
              >Goals</label
            >
            <div class="flex flex-wrap gap-1.5">
              <Badge
                v-for="goal in profile.goals"
                :key="goal"
                class="bg-accent/10 border-accent/20 text-primary font-bold px-3 py-1.5 text-sm rounded-full"
              >
                {{ goalLabel(goal) }}
              </Badge>
            </div>
          </div>

          <div v-if="profile.vibes.length > 0" class="space-y-1.5">
            <label
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
              >Vibes</label
            >
            <div class="flex flex-wrap gap-1.5">
              <Badge
                v-for="vibe in profile.vibes"
                :key="vibe"
                class="bg-secondary/40 border-transparent text-muted-foreground font-bold px-3 py-1.5 text-sm rounded-full"
              >
                {{ vibe }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Social Stats -->
        <div class="grid grid-cols-3 gap-3">
          <NuxtLink
            v-for="stat in stats"
            :key="stat.label"
            :to="stat.to"
            :class="[
              'group relative p-4 rounded-2xl border text-center transition-transform hover:scale-105 active:scale-95 overflow-hidden',
              stat.class,
            ]"
          >
            <p class="text-lg font-black text-primary">{{ stat.value }}</p>
            <p
              class="text-[11px] font-black text-muted-foreground/70 uppercase tracking-widest"
            >
              {{ stat.label }}
            </p>
            <div
              class="absolute inset-0 flex items-center justify-center bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon :name="stat.icon" size="22" class="text-white" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
