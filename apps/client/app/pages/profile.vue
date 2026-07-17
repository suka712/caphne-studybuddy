<script setup lang="ts">
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

</script>

<template>
  <Card v-if="isCheckingProfile">
    <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
  </Card>

  <div v-else-if="profile">
    <!-- Header -->
    <div class="p-8 pb-6 flex flex-col items-center text-center space-y-4">
      <div
        class="size-24 rounded-[2rem] bg-secondary flex items-center justify-center overflow-hidden border-4 border-background shadow-xl"
      >
        <img
          v-if="profile?.photoUrl"
          :src="profile.photoUrl"
          class="w-full h-full object-cover"
        />
        <Icon
          v-else
          name="material-symbols:person-heart-rounded"
          size="48"
          class="text-primary/20"
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
    <div class="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
      <div
        class="p-6 rounded-[2rem] bg-secondary/30 border border-primary/5 space-y-5"
      >
        <div class="space-y-1">
          <label
            class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >Major</label
          >
          <p class="text-lg font-bold text-primary">{{ profile.major }}</p>
        </div>

        <div class="space-y-1">
          <label
            class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >Year</label
          >
          <p class="text-lg font-bold text-primary">{{ profile.year }}</p>
        </div>

        <div v-if="profile.bio" class="space-y-1">
          <label
            class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
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
            class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
          >
            {{ stat.label }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
