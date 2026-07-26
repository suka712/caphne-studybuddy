<script setup lang="ts">
import { toast } from "vue-sonner";
import { Badge } from "~/components/ui/badge";
import Button from "~/components/ui/button/Button.vue";
import { yearOptions, majorOptions, goalOptions } from "~/data/profileOptions";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

type SwipeCandidate = {
  userId: number;
  displayName: string;
  major: string;
  year: string;
  bio: string;
  photoUrl: string | null;
  goals: string[];
  vibes: string[];
  interests: string[];
};

const {
  public: { apiBase },
} = useRuntimeConfig();

const { data, pending: isLoading } = await useAsyncData(
  "matches-candidates",
  () =>
    $fetch<{ profiles: SwipeCandidate[] }>(`${apiBase}/swipes`, {
      credentials: "include",
    }),
  { lazy: true, deep: true },
);

const remainingCandidates = computed(() => data.value?.profiles ?? []);
const isSwiping = ref(false);
const lastDecision = ref<"like" | "pass">("pass");
const isLikeHovered = ref(false);

const currentCandidate = computed(() => remainingCandidates.value[0] ?? null);
const noMoreCandidates = computed(() => remainingCandidates.value.length === 0);

const yearLabel = (value: string) =>
  yearOptions.find((y) => y.value === value)?.label ?? value;

const majorLabel = (value: string) =>
  majorOptions.flatMap((g) => g.items).find((i) => i.value === value)?.label ??
  value;

const goalLabel = (id: string) =>
  goalOptions.find((g) => g.id === id)?.label ?? id;

const handleSwipe = async (decision: "like" | "pass") => {
  if (!currentCandidate.value || isSwiping.value) return;

  const targetUserId = currentCandidate.value.userId;
  isSwiping.value = true;
  lastDecision.value = decision;
  if (data.value) {
    data.value.profiles = data.value.profiles.slice(1);
  }

  try {
    await $fetch(`${apiBase}/swipes`, {
      method: "POST",
      credentials: "include",
      body: { targetUserId, decision },
    });
  } catch (e) {
    console.error("Failed to record swipe:", e);
    toast.error("Failed to record swipe");
  } finally {
    isSwiping.value = false;
  }
};

const tagClass = "bg-accent/15 border-accent/30 text-primary font-bold";
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div
      class="shrink-0 px-6 pt-6 pb-4 border-b border-primary/10 flex items-center justify-between"
    >
      <h1 class="text-xl font-black tracking-tight text-primary">
        Matches
      </h1>
    </div>

    <div class="flex-1 min-h-0 flex flex-col items-center justify-center p-6">
      <div v-if="isLoading" class="w-full max-w-xs h-[26rem]">
        <div class="relative z-10 w-full overflow-hidden bg-card border border-primary/15 shadow-md rounded-xl p-5 space-y-4">
          <div class="flex items-center gap-3">
            <Skeleton class="size-14 rounded-2xl shrink-0" />
            <div class="space-y-2 min-w-0 flex-1">
              <Skeleton class="h-5 w-32 rounded-md" />
              <Skeleton class="h-4 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton class="h-10 w-full rounded-lg" />
          <div class="space-y-2">
            <Skeleton class="h-3 w-20 rounded-md" />
            <div class="flex gap-1.5">
              <Skeleton class="h-6 w-16 rounded-full" />
              <Skeleton class="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div class="space-y-2">
            <Skeleton class="h-3 w-16 rounded-md" />
            <div class="flex gap-1.5">
              <Skeleton class="h-6 w-14 rounded-full" />
              <Skeleton class="h-6 w-18 rounded-full" />
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <Skeleton class="h-12 flex-1 rounded-2xl" />
            <Skeleton class="h-12 flex-1 rounded-2xl" />
          </div>
        </div>
      </div>

      <div
        v-else-if="noMoreCandidates"
        class="flex flex-col items-center text-center gap-3"
      >
        <div class="size-14 rounded-2xl bg-secondary/60 flex items-center justify-center">
          <Icon name="lucide:check-check" size="24" class="text-muted-foreground/60" />
        </div>
        <p class="text-sm font-bold text-muted-foreground max-w-[200px]">
          You've reached the end of today's matches.
        </p>
        <Button as-child variant="secondary" class="rounded-2xl h-10 px-5 font-black">
          <router-link to="/chat">Go to chat</router-link>
        </Button>
      </div>

      <div v-else class="relative w-full max-w-xs h-[26rem]">
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-13 w-[70%] h-full bg-amber-100 border border-b-0 border-primary/10 rounded-xl z-0"
        />
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-9 w-[82%] h-full bg-blue-100 border border-b-0 border-primary/10 rounded-xl z-0"
        />
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-5 w-[90%] h-full bg-orange-100 border border-b-0 border-primary/10 rounded-xl z-[5]"
        />

        <Transition
          :name="lastDecision === 'like' ? 'swipe-right' : 'swipe-left'"
          mode="out-in"
        >
          <div
            v-if="currentCandidate"
            :key="currentCandidate.userId"
            class="relative z-10 w-full h-full overflow-hidden bg-cafe-cream border border-primary/15 shadow-md shadow-primary/10 rounded-xl p-5 flex flex-col gap-4"
          >
            <div class="flex items-center gap-3 shrink-0">
              <img
                v-if="currentCandidate.photoUrl"
                :src="currentCandidate.photoUrl"
                alt="Profile"
                class="size-14 rounded-2xl object-cover shadow-sm shrink-0"
              />
              <div
                v-else
                class="size-14 rounded-2xl bg-secondary/60 flex items-center justify-center shrink-0 shadow-sm"
              >
                <Icon
                  name="lucide:user"
                  size="26"
                  class="text-muted-foreground/50"
                />
              </div>
              <div class="min-w-0">
                <p class="font-black tracking-tight text-primary truncate">
                  {{ currentCandidate.displayName }}
                </p>
                <p class="text-sm font-bold text-muted-foreground truncate">
                  {{ majorLabel(currentCandidate.major) }} ·
                  {{ yearLabel(currentCandidate.year) }}
                </p>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 -mr-1">
              <p
                v-if="currentCandidate.bio"
                class="text-sm text-muted-foreground font-medium leading-relaxed"
              >
                {{ currentCandidate.bio }}
              </p>

              <div v-if="currentCandidate.goals.length > 0" class="space-y-1.5">
                <div class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Looking for
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge
                    v-for="goal in currentCandidate.goals"
                    :key="goal"
                    :class="tagClass"
                  >
                    {{ goalLabel(goal) }}
                  </Badge>
                </div>
              </div>

              <div v-if="currentCandidate.vibes.length > 0" class="space-y-1.5">
                <div class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Vibes
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge
                    v-for="vibe in currentCandidate.vibes"
                    :key="vibe"
                    :class="tagClass"
                  >
                    {{ vibe }}
                  </Badge>
                </div>
              </div>

              <div
                v-if="currentCandidate.interests.length > 0"
                class="space-y-1.5"
              >
                <div class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Interests
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge
                    v-for="interest in currentCandidate.interests"
                    :key="interest"
                    :class="tagClass"
                  >
                    {{ interest }}
                  </Badge>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-2 shrink-0">
              <Button
                variant="outline"
                class="group flex-1 rounded-2xl h-12 font-black border-primary/10 active:scale-95 transition-transform"
                :disabled="isSwiping"
                @click="handleSwipe('pass')"
              >
                <Icon
                  name="lucide:x"
                  size="18"
                  class="mr-2 transition-transform duration-300 group-hover:rotate-90"
                />
                Pass
              </Button>
              <Button
                class="flex-1 rounded-2xl h-12 font-black bg-accent text-accent-foreground hover:bg-accent/80 shadow-lg shadow-primary/10 active:scale-95 transition-transform"
                :disabled="isSwiping"
                @mouseenter="isLikeHovered = true"
                @mouseleave="isLikeHovered = false"
                @click="handleSwipe('like')"
              >
                <Icon
                  :name="isLikeHovered ? 'mdi:heart' : 'mdi:heart-outline'"
                  size="18"
                  class="mr-2"
                />
                Like
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
