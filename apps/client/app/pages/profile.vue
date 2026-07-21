<script setup lang="ts">
import { majorOptions, yearOptions, goalOptions } from "~/data/profileOptions";
import { fieldLabelClass, chipViewClass } from "~/lib/utils";
import { Switch } from "@/components/ui/switch";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

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

const { saveProfileField } = useProfileFieldSave();

const togglePublic = async (checked: boolean) => {
  await saveProfileField(
    { isPublic: checked },
    {
      successMessage: checked ? "Profile is now public" : "Profile is now private",
      errorMessage: "Failed to update visibility",
    },
  );
};
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
        class="shrink-0 px-6 pt-6 pb-4 border-b border-primary/10 flex items-center justify-between"
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
        <!-- Identity + bio -->
        <div
          class="p-4 rounded-xl bg-secondary/50 border border-primary/10 space-y-3"
        >
          <div class="flex items-center gap-4">
            <div
              class="size-16 rounded-2xl bg-secondary/60 flex items-center justify-center overflow-hidden shadow-sm shrink-0"
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
              <h2 class="truncate text-xl font-black tracking-tight text-primary">
                {{ profile.displayName }}
              </h2>
              <p class="truncate text-sm font-bold text-muted-foreground mt-0.5">
                {{ majorLabel(profile.major) }} · {{ yearLabel(profile.year) }}
              </p>
            </div>
          </div>

          <p
            v-if="profile.bio"
            class="text-sm text-muted-foreground font-medium leading-relaxed"
          >
            {{ profile.bio }}
          </p>

          <div class="border-t border-primary/10 pt-3.5 space-y-2">
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
          </div>
        </div>

        <!-- Visibility Settings Card -->
        <div
          class="p-4 rounded-xl bg-secondary/50 border border-primary/10 flex items-center justify-between gap-4"
        >
          <div class="space-y-1">
            <h3 class="text-sm font-black tracking-tight text-primary">
              Profile Visibility
            </h3>
            <p class="text-xs text-muted-foreground font-medium leading-normal max-w-[280px]">
              {{
                profile.isPublic
                  ? "Your profile is open to be discovered by others"
                  : "You can switch this to make your profile discoverable by other users"
              }}
            </p>
          </div>
          <Switch
            :checked="profile.isPublic"
            class="shrink-0"
            @update:checked="togglePublic"
          />
        </div>

        <!-- Activity -->
        <section class="space-y-2">
          <div class="grid grid-cols-3 gap-3">
            <NuxtLink
              v-for="stat in stats"
              :key="stat.label"
              :to="stat.to"
              class="group flex flex-col items-center justify-center gap-1 aspect-square p-4 rounded-xl border text-center transition-all active:scale-95 bg-secondary/50 border-primary/10 hover:bg-secondary/70 hover:border-accent/30 hover:shadow-md hover:shadow-primary/10"
            >
              <p class="text-lg font-black text-primary leading-none transition-colors group-hover:text-accent">
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
