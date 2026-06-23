<script setup lang="ts">
import { toast } from "vue-sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { SocketEvents } from "@caphne/shared/socket-events";

definePageMeta({
  middleware: "auth",
  layout: "internal",
});

const { getSocket } = useSocket();
const { getUnreadCount, initUnreadCounts } = useChatNotifications();
const { fetchProfile } = useProfile();

const {
  public: { apiBase },
} = useRuntimeConfig();

interface MatchCard {
  matchId: number;
  displayName: string;
  major: string;
  year: string;
  photoUrl: string | null;
  matchedAt: string;
  unreadCount: number;
  isOnline: boolean;
  lastActiveAt: string | null;
}

const matches = ref<MatchCard[]>([]);
const isLoading = ref(true);
const isGenerating = ref(false);
const onCooldown = ref(false);
const canGenerate = computed(() => !onCooldown.value && !isGenerating.value);

const fetchMatches = async () => {
  try {
    const data = await $fetch<{ matches: MatchCard[] }>(`${apiBase}/matches`, {
      credentials: "include",
    });
    matches.value = data.matches;
  } catch (e) {
    console.error("Failed to fetch matches:", e);
    toast.error("Failed to load matches");
  }
};

onMounted(async () => {
  await Promise.all([fetchMatches(), fetchProfile()]);
  initUnreadCounts(matches.value);
  isLoading.value = false;

  const socket = getSocket();
  if (socket) {
    socket.on(
      SocketEvents.USER_HAS_NEW_MESSAGE,
      (data: { matchId: number }) => {
        const idx = matches.value.findIndex((m) => m.matchId === data.matchId);
        if (idx > 0) {
          const [match] = matches.value.splice(idx, 1);
          matches.value.unshift(match!);
        }
      },
    );
  }
});

const handleGenerate = async () => {
  isGenerating.value = true;
  try {
    const result = await $fetch<{ match: any }>(`${apiBase}/matches`, {
      method: "POST",
      credentials: "include",
    });
    await fetchMatches();
    if (result) {
      toast.success("New match found!");
    } else {
      toast.info("No more matches available right now");
    }
    onCooldown.value = true;
    setTimeout(() => {
      onCooldown.value = false;
    }, 2_000);
  } catch (e: any) {
    if (e?.response?.status === 429) {
      toast.error("You have reached your match limit for today");
    } else {
      toast.error("Failed to generate matches");
    }
  } finally {
    isGenerating.value = false;
  }
};
</script>

<template>
  <div class="h-full">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
    </div>

    <div
      v-else
      class="h-full overflow-hidden flex flex-col bg-card border shadow-sm rounded-xl"
    >
      <!-- Header -->
      <div
        class="p-6 border-b border-primary/5 flex items-center justify-between"
      >
        <h1 class="text-xl font-black text-primary flex items-center gap-2">
          Matches
          <span
            class="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
          >
            {{ matches.length }}
          </span>
        </h1>
        <Button
          variant="outline"
          class="rounded-xl h-9 px-4 font-bold border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
          :disabled="!canGenerate"
          @click="handleGenerate"
        >
          <Icon
            v-if="isGenerating"
            name="svg-spinners:ring-resize"
            size="14"
            class="mr-2"
          />
          <Icon v-else name="lucide:sparkles" size="14" class="mr-2" />
          New
        </Button>
      </div>

      <!-- Matches List -->
      <ScrollArea class="flex-1 min-h-0">
        <div class="p-4 space-y-3">
          <p
            v-if="matches.length === 0"
            class="text-muted-foreground text-sm text-center py-12 font-bold italic"
          >
            No matches yet. Click "New" to start!
          </p>

          <NuxtLink
            v-for="match in matches"
            :key="match.matchId"
            :to="`/chat/${match.matchId}`"
            class="flex items-center gap-4 rounded-3xl bg-secondary/30 hover:bg-secondary/60 transition-all cursor-pointer p-3 border border-transparent hover:border-primary/5 group"
          >
            <div class="relative shrink-0">
              <div
                class="size-12 rounded-2xl bg-background flex items-center justify-center overflow-hidden border-2 border-background shadow-md"
              >
                <img
                  v-if="match.photoUrl"
                  :src="match.photoUrl"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="mdi:account"
                  size="24"
                  class="text-muted-foreground"
                />
              </div>
              <span
                class="absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-background"
                :class="match.isOnline ? 'bg-green-500' : 'bg-slate-400'"
              />
            </div>
            <div class="overflow-hidden flex-1">
              <p
                class="text-sm font-black text-primary truncate group-hover:text-accent transition-colors"
              >
                {{ match.displayName }}
              </p>
              <p class="text-[11px] font-bold text-muted-foreground truncate">
                {{ match.major }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              <Badge
                v-if="getUnreadCount(match.matchId) > 0"
                class="bg-accent text-primary-foreground font-black animate-bounce"
              >
                {{ getUnreadCount(match.matchId) }}
              </Badge>
              <Icon
                name="lucide:chevron-right"
                size="16"
                class="text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </NuxtLink>
        </div>
      </ScrollArea>
    </div>
  </div>
</template>
