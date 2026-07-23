<script setup lang="ts">
import { toast } from "vue-sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { SocketEvents } from "@caphne/shared/socket-events";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

const { getSocket } = useSocket();
const { getUnreadCount, initUnreadCounts } = useChatNotifications();

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

const { data, pending: isLoading } = await useAsyncData(
  "chat-matches",
  () =>
    $fetch<{ matches: MatchCard[] }>(`${apiBase}/matches`, {
      credentials: "include",
    }).catch((e) => {
      console.error("Failed to fetch matches:", e);
      toast.error("Failed to load matches");
      return { matches: [] as MatchCard[] };
    }),
  { lazy: true, deep: true },
);

const matches = computed(() => data.value?.matches ?? []);

let listenersReady = false;

watch(
  isLoading,
  (loading) => {
    if (loading || listenersReady) return;
    listenersReady = true;

    initUnreadCounts(matches.value);

    const socket = getSocket();
    if (socket) {
      socket.on(
        SocketEvents.USER_HAS_NEW_MESSAGE,
        (payload: { matchId: number }) => {
          if (!data.value) return;
          const idx = data.value.matches.findIndex(
            (m) => m.matchId === payload.matchId,
          );
          if (idx > 0) {
            const [match] = data.value.matches.splice(idx, 1);
            data.value.matches.unshift(match!);
          }
        },
      );
    }
  },
  { immediate: true },
);

</script>

<template>
  <div class="h-full">
    <div v-if="isLoading" class="h-full flex flex-col min-h-0">
      <div class="shrink-0 px-6 pt-6 pb-4 border-b border-primary/10 flex items-center justify-between">
        <Skeleton class="h-7 w-20 rounded-lg" />
      </div>
      <div class="p-4 space-y-3 flex-1 overflow-y-auto">
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-4 rounded-3xl p-3 border border-primary/10 bg-secondary/30"
        >
          <Skeleton class="size-12 rounded-2xl shrink-0" />
          <div class="space-y-2 flex-1 min-w-0">
            <Skeleton class="h-4 w-32 rounded-md" />
            <Skeleton class="h-3 w-20 rounded-md" />
          </div>
          <Skeleton class="size-4 rounded-full shrink-0" />
        </div>
      </div>
    </div>

    <div v-else class="h-full flex flex-col min-h-0">
      <!-- Header -->
      <div
        class="shrink-0 px-6 pt-6 pb-4 border-b border-primary/10 flex items-center justify-between"
      >
        <h1 class="text-xl font-black tracking-tight text-primary flex items-center gap-2">
          Chats
          <span
            class="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
          >
            {{ matches.length }}
          </span>
        </h1>
      </div>

      <!-- Matches List -->
      <ScrollArea class="flex-1 min-h-0">
        <div class="p-4 space-y-3">
          <div
            v-if="matches.length === 0"
            class="flex flex-col items-center text-center gap-3 py-16"
          >
            <div class="size-14 rounded-2xl bg-secondary/60 flex items-center justify-center">
              <Icon name="lucide:message-circle" size="24" class="text-muted-foreground/60" />
            </div>
            <p class="text-sm font-bold text-muted-foreground max-w-[200px]">
              No chats yet.
            </p>
            <NuxtLink to="/discover">
              <Button variant="secondary" class="rounded-2xl h-10 px-5 font-black">
                Find people to chat with
              </Button>
            </NuxtLink>
          </div>

          <NuxtLink
            v-for="match in matches"
            :key="match.matchId"
            :to="`/chat/${match.matchId}`"
            class="flex items-center gap-4 rounded-3xl bg-secondary/50 hover:bg-secondary/70 hover:shadow-md hover:shadow-primary/10 transition-all cursor-pointer p-3 border border-primary/10 hover:border-accent/30 group"
          >
            <div class="relative shrink-0">
              <div
                class="size-12 rounded-2xl bg-secondary/60 flex items-center justify-center overflow-hidden shadow-sm"
              >
                <img
                  v-if="match.photoUrl"
                  :src="match.photoUrl"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="lucide:user"
                  size="22"
                  class="text-muted-foreground/50"
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
