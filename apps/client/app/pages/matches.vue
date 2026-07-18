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
  | { decision: "like"; matched: true };

const {
  public: { apiBase },
} = useRuntimeConfig();

const remainingCandidates = ref<SwipeCandidate[]>([]);
const isLoading = ref(true);
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

const fetchBatch = async () => {
  const data = await $fetch<{ profiles: SwipeCandidate[] }>(
    `${apiBase}/swipes`,
    { credentials: "include" },
  );

  remainingCandidates.value = data.profiles;
};

const handleSwipe = async (decision: "like" | "pass") => {
  if (!currentCandidate.value || isSwiping.value) return;

  const targetUserId = currentCandidate.value.userId;
  isSwiping.value = true;
  lastDecision.value = decision;
  // Drop immediately so the card animates out right on tap, instead of
  // waiting on the network round trip before showing any feedback. No new
  // fetch needed — the rest of today's batch is already in hand.
  remainingCandidates.value = remainingCandidates.value.slice(1);

  try {
    const result = await $fetch<SwipeResponse>(`${apiBase}/swipes`, {
      method: "POST",
      credentials: "include",
      body: { targetUserId, decision },
    });

    if (result.decision === "like" && result.matched) {
      toast.success("It's a match!");
    }
  } catch (e) {
    console.error("Failed to record swipe:", e);
    toast.error("Failed to record swipe");
  } finally {
    isSwiping.value = false;
  }
};

onMounted(async () => {
  await fetchBatch();
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
        class="text-muted-foreground"
      >
        You've reached the end of today's matches.
      </div>

      <div v-else class="relative w-full max-w-xs min-h-[26rem]">
        <!-- Deck stack: static cards peeking out behind the current one -->
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-8 w-[82%] h-full bg-amber-50 border border-b-0 border-primary/10 rounded-md z-0"
        />
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-4 w-[90%] h-full bg-amber-100 border border-b-0 border-primary/10 rounded-md z-[5]"
        />

        <Transition
          :name="lastDecision === 'like' ? 'swipe-right' : 'swipe-left'"
          mode="out-in"
        >
          <div
            v-if="currentCandidate"
            :key="currentCandidate.userId"
            class="relative z-10 w-full overflow-hidden bg-secondary border border-primary/5 rounded-xl p-5 space-y-4"
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

            <p
              v-if="currentCandidate.bio"
              class="text-sm text-muted-foreground"
            >
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

            <div
              v-if="currentCandidate.interests.length > 0"
              class="space-y-1.5"
            >
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
                class="group flex-1 rounded-xl h-11"
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
                class="flex-1 rounded-xl h-11 bg-accent text-accent-foreground hover:bg-amber-500"
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
