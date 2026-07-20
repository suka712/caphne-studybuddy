<script setup lang="ts">
import { majorOptions, yearOptions, goalOptions } from "~/data/profileOptions";
import { fieldLabelClass, chipViewClass } from "~/lib/utils";

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
    label: "Profiles",
    value: publicProfileCount.publicProfiles,
    to: "/discover",
    icon: "lucide:compass",
  },
  {
    label: "Matches",
    value: matchCount.matchCount,
    to: "/matches",
    icon: "lucide:heart",
  },
  {
    label: "Chats",
    value: chatCount.chats,
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
    <div
      v-if="isCheckingProfile"
      class="flex items-center justify-center h-full"
    >
      <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
    </div>

    <div v-else-if="profile" class="h-full flex flex-col">
      <!-- Header -->
      <div
        class="shrink-0 px-6 pt-6 pb-4 border-b border-primary/5 flex items-center justify-between"
      >
        <h1 class="text-xl font-black tracking-tight text-primary">Profile</h1>
        <Button
          as-child
          variant="outline"
          class="rounded-2xl h-10 px-4 font-black text-sm gap-1.5 border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <NuxtLink to="/settings">
            <Icon name="lucide:pencil" size="14" />
            Edit
          </NuxtLink>
        </Button>
      </div>

      <!-- Content -->
      <div class="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
        <!-- Identity -->
        <div
          class="flex items-center gap-4 p-4 rounded-3xl bg-secondary/20 border border-primary/5"
        >
          <div
            class="size-16 rounded-2xl bg-secondary/40 flex items-center justify-center overflow-hidden shadow-md shrink-0"
          >
            <img
              v-if="profile.photoUrl"
              :src="profile.photoUrl"
              class="w-full h-full object-cover"
            />
            <Icon
              v-else
              name="lucide:user"
              size="30"
              class="text-muted-foreground/50"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h2
                class="flex-1 truncate text-xl font-black tracking-tight text-primary"
              >
                {{ profile.displayName }}
              </h2>
              <span
                class="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-secondary/50 px-2 py-0.5"
              >
                <span
                  class="size-1.5 rounded-full"
                  :class="
                    profile.isPublic ? 'bg-accent' : 'bg-muted-foreground/40'
                  "
                />
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80"
                >
                  {{ profile.isPublic ? "Public" : "Private" }}
                </span>
              </span>
            </div>
            <p class="truncate text-sm font-bold text-muted-foreground">
              {{ majorLabel(profile.major) }} · {{ yearLabel(profile.year) }}
            </p>
            <p class="truncate text-xs font-bold text-muted-foreground/60">
              {{ authUser?.email }}
            </p>
          </div>
        </div>

        <!-- Bio -->
        <section v-if="profile.bio" class="space-y-1.5">
          <div :class="fieldLabelClass">Bio</div>
          <p class="text-sm font-medium leading-relaxed text-muted-foreground">
            {{ profile.bio }}
          </p>
        </section>

        <!-- Looking for -->
        <section class="space-y-2">
          <div :class="fieldLabelClass">Looking for</div>
          <div v-if="profile.goals.length > 0" class="flex flex-wrap gap-1.5">
            <Badge
              v-for="goal in profile.goals"
              :key="goal"
              :class="chipViewClass"
            >
              {{ goalLabel(goal) }}
            </Badge>
          </div>
          <NuxtLink
            v-else
            to="/settings"
            class="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/15 px-3 py-1.5 text-sm font-bold text-muted-foreground/70 hover:border-accent/40 hover:text-primary transition-colors"
          >
            <Icon name="lucide:plus" size="14" />
            Add what you're looking for
          </NuxtLink>
        </section>

        <!-- Activity -->
        <section class="space-y-2">
          <div :class="fieldLabelClass">Activity</div>
          <div class="grid grid-cols-3 gap-3">
            <NuxtLink
              v-for="stat in stats"
              :key="stat.label"
              :to="stat.to"
              class="flex flex-col items-center gap-1 p-4 rounded-2xl border text-center transition-all active:scale-95 bg-secondary/20 border-primary/5 hover:bg-secondary/40 hover:border-accent/20 hover:shadow-sm"
            >
              <Icon
                :name="stat.icon"
                size="18"
                class="text-muted-foreground/50"
              />
              <p class="text-lg font-black text-primary leading-none">
                {{ stat.value }}
              </p>
              <p
                class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
              >
                {{ stat.label }}
              </p>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
