<script setup lang="ts">
import { toast } from "vue-sonner";
import { Badge } from "~/components/ui/badge";
import { yearOptions, majorOptions, goalOptions } from "~/data/startOptions";

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

type SwipeResponse =
  | { decision: "pass" }
  | { decision: "like"; matched: true }
  | { decision: "like"; matched: false; reason: "quota_exceeded" };

const {
  public: { apiBase },
} = useRuntimeConfig();

const currentCandidate = ref<SwipeCandidate | null>(null);
const isLoading = ref(true);
const isSwiping = ref(false);
const noMoreCandidates = ref(false);

const yearLabel = (value: string) =>
  yearOptions.find((y) => y.value === value)?.label ?? value;

const majorLabel = (value: string) =>
  majorOptions.flatMap((g) => g.items).find((i) => i.value === value)?.label ??
  value;

const goalLabel = (id: string) =>
  goalOptions.find((g) => g.id === id)?.label ?? id;

const fetchNextCandidate = async () => {
  const data = await $fetch<{ profile: SwipeCandidate | null }>(
    `${apiBase}/swipes/next`,
    { credentials: "include" },
  );

  currentCandidate.value = data.profile;
  noMoreCandidates.value = !data.profile;
};

const handleSwipe = async (decision: "like" | "pass") => {
  if (!currentCandidate.value || isSwiping.value) return;

  isSwiping.value = true;
  try {
    const result = await $fetch<SwipeResponse>(`${apiBase}/swipes`, {
      method: "POST",
      credentials: "include",
      body: { targetUserId: currentCandidate.value.userId, decision },
    });

    if (result.decision === "like") {
      if (result.matched) {
        toast.success("It's a match!");
      } else if (result.reason === "quota_exceeded") {
        toast.error(
          "Liked! But you've hit today's match limit — this profile won't come back.",
        );
      }
    }

    await fetchNextCandidate();
  } catch (e) {
    console.error("Failed to record swipe:", e);
    toast.error("Failed to record swipe");
  } finally {
    isSwiping.value = false;
  }
};

onMounted(async () => {
  await fetchNextCandidate();
  isLoading.value = false;
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div
      class="p-5 pb-4 pl-6 border-b border-primary/5 flex items-center justify-between"
    >
      <h1 class="text-xl font-black text-primary flex items-center gap-2">
        Matches
      </h1>
    </div>

    <div class="flex-1 min-h-0 flex flex-col items-center justify-center p-5">
      <div v-if="isLoading" class="flex items-center justify-center">
        <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
      </div>

      <div
        v-else-if="noMoreCandidates"
        class="text-center text-muted-foreground text-sm font-bold italic"
      >
        No more profiles right now. Please check back later.
      </div>

      <div
        v-else-if="currentCandidate"
        class="w-full max-w-xs bg-secondary/30 border border-primary/5 rounded-3xl p-5 space-y-4"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="currentCandidate.photoUrl"
            :src="currentCandidate.photoUrl"
            alt="Profile"
            class="size-14 rounded-sm object-cover shadow-md shrink-0"
          />
          <div
            v-else
            class="size-14 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0"
          >
            <Icon
              name="mdi:account"
              size="28"
              class="text-muted-foreground"
            />
          </div>
          <div class="min-w-0">
            <p class="font-black text-primary truncate">
              {{ currentCandidate.displayName }}
            </p>
            <p class="text-sm text-muted-foreground truncate">
              {{ majorLabel(currentCandidate.major) }} ·
              {{ yearLabel(currentCandidate.year) }}
            </p>
          </div>
        </div>

        <p v-if="currentCandidate.bio" class="text-sm text-muted-foreground">
          {{ currentCandidate.bio }}
        </p>

        <div v-if="currentCandidate.goals.length > 0" class="space-y-1.5">
          <div class="text-[11px] font-bold text-muted-foreground/70">
            Looking for
          </div>
          <div class="flex flex-wrap gap-1.5">
            <Badge
              v-for="goal in currentCandidate.goals"
              :key="goal"
              variant="outline"
            >
              {{ goalLabel(goal) }}
            </Badge>
          </div>
        </div>

        <div v-if="currentCandidate.vibes.length > 0" class="space-y-1.5">
          <div class="text-[11px] font-bold text-muted-foreground/70">
            Vibes
          </div>
          <div class="flex flex-wrap gap-1.5">
            <Badge
              v-for="vibe in currentCandidate.vibes"
              :key="vibe"
              variant="outline"
            >
              {{ vibe }}
            </Badge>
          </div>
        </div>

        <div v-if="currentCandidate.interests.length > 0" class="space-y-1.5">
          <div class="text-[11px] font-bold text-muted-foreground/70">
            Interests
          </div>
          <div class="flex flex-wrap gap-1.5">
            <Badge
              v-for="interest in currentCandidate.interests"
              :key="interest"
              variant="outline"
            >
              {{ interest }}
            </Badge>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <Button
            variant="outline"
            class="flex-1 rounded-xl h-11"
            :disabled="isSwiping"
            @click="handleSwipe('pass')"
          >
            <Icon name="lucide:x" size="18" class="mr-2" />
            Pass
          </Button>
          <Button
            class="flex-1 rounded-xl h-11 bg-accent hover:bg-accent/90"
            :disabled="isSwiping"
            @click="handleSwipe('like')"
          >
            <Icon name="lucide:heart" size="18" class="mr-2" />
            Like
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
