<script setup lang="ts">
import { majorOptions, yearOptions } from "~/data/startOptions";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

const { authUser } = useAuth();
const { profile, isCheckingProfile } = useProfile();

const {
  public: { apiBase },
} = useRuntimeConfig();

const matchCount = await $fetch<{ matchCount: number }>(
  `${apiBase}/matches/count`,
  {
    method: "GET",
    credentials: "include",
  },
);

const stats = computed(() => [
  {
    label: "Matches",
    value: matchCount.matchCount,
    class: "bg-accent/10 border-accent/20",
  },
]);

const majorLabel = (value: string) =>
  majorOptions.flatMap((g) => g.items).find((i) => i.value === value)?.label ??
  value;

const yearLabel = (value: string) =>
  yearOptions.find((y) => y.value === value)?.label ?? value;
</script>

<template>
  <div class="h-full">
    <div v-if="isCheckingProfile" class="flex items-center justify-center h-full">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
    </div>

    <div v-else-if="profile" class="h-full flex flex-col">
      <!-- Header -->
      <div class="shrink-0 p-8 pb-6 flex flex-col items-center text-center gap-4">
        <div
          class="size-24 rounded-2xl bg-secondary/40 flex items-center justify-center overflow-hidden shadow-xl"
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
        </div>
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

          <div v-if="profile.bio" class="space-y-1">
            <label
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
              >Bio</label
            >
            <p class="text-sm font-medium leading-relaxed text-muted-foreground">
              {{ profile.bio }}
            </p>
          </div>
        </div>

        <!-- Social Stats -->
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="stat in stats"
            :key="stat.label"
            :class="['p-4 rounded-2xl border text-center', stat.class]"
          >
            <p class="text-lg font-black text-primary">{{ stat.value }}</p>
            <p
              class="text-[11px] font-black text-muted-foreground/70 uppercase tracking-widest"
            >
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
