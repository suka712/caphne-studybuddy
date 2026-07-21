<script setup lang="ts">
import { toast } from "vue-sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "~/types/chat";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

const route = useRoute();
const {
  public: { apiBase },
} = useRuntimeConfig();
const { authUser } = useAuth();

const matchId = Number(route.params.matchId);
const currentUserId = computed(() => authUser.value?.id);

const messages = ref<ChatMessage[]>([]);
const matchDisplayName = ref("");
const newMessage = ref("");
const isLoading = ref(true);
const isLoadingMore = ref(false);
const hasMore = ref(true);
const scrollAreaRef = ref<InstanceType<typeof ScrollArea> | null>(null);
const isMatchOnline = ref(false);
const matchLastActiveAt = ref<string | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    const viewport = scrollAreaRef.value?.$el?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  });
};

const { isConnected, setupListeners, sendMessage, cleanup } = useChatSocket(
  matchId,
  messages,
  currentUserId,
  scrollToBottom,
);

const canSend = computed(
  () => isConnected.value && newMessage.value.trim().length > 0,
);

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const PAGE_SIZE = 50;

const fetchMessages = async (beforeId?: number) => {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (beforeId) params.set("before", String(beforeId));

  const data = await $fetch<{ messages: ChatMessage[] }>(
    `${apiBase}/chat/${matchId}/messages?${params}`,
    { credentials: "include" },
  );
  return data.messages;
};

const loadMore = async () => {
  if (!hasMore.value || messages.value.length === 0) return;
  isLoadingMore.value = true;
  try {
    const oldestId = messages.value[0]!.id;
    const older = await fetchMessages(oldestId);
    if (older.length < PAGE_SIZE) hasMore.value = false;
    messages.value = [...older, ...messages.value];
  } catch {
    toast.error("Failed to load older messages");
  } finally {
    isLoadingMore.value = false;
  }
};

const handleSend = () => {
  const content = newMessage.value.trim();
  if (!content) return;
  sendMessage(content);
  newMessage.value = "";
};

const icebreakers = [
  "Hey! What are you studying?",
  "Want to be study buddies?",
  "Coffee and a cram session sometime?",
];

const useIcebreaker = (text: string) => {
  newMessage.value = text;
};

onMounted(async () => {
  try {
    const matchesData = await $fetch<{ matches: any[] }>(`${apiBase}/matches`, {
      credentials: "include",
    });
    const thisMatch = matchesData.matches.find(
      (m: any) => m.matchId === matchId,
    );
    if (!thisMatch) {
      toast.error("Match not found");
      navigateTo("/chat");
      return;
    }
    matchDisplayName.value = thisMatch.displayName;
    isMatchOnline.value = thisMatch.isOnline;
    matchLastActiveAt.value = thisMatch.lastActiveAt;

    const initialMessages = await fetchMessages();
    messages.value = initialMessages;
    if (initialMessages.length < PAGE_SIZE) hasMore.value = false;
    isLoading.value = false;
    scrollToBottom();

    setupListeners();
  } catch (e) {
    console.error("Failed to initialize chat:", e);
    toast.error("Failed to load chat");
    navigateTo("/chat");
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div class="h-full">
    <div v-if="isLoading" class="h-full flex flex-col min-h-0 overflow-hidden">
      <div class="shrink-0 px-6 py-4 border-b border-primary/10 flex items-center gap-3">
        <Skeleton class="size-10 rounded-xl shrink-0" />
        <div class="space-y-1.5 flex-1 min-w-0">
          <Skeleton class="h-5 w-32 rounded-md" />
          <Skeleton class="h-3 w-16 rounded-md" />
        </div>
      </div>
      <div class="flex-1 p-4 space-y-4">
        <div class="flex items-start mr-auto max-w-[70%]">
          <Skeleton class="h-10 w-44 rounded-2xl rounded-tl-sm" />
        </div>
        <div class="flex items-end ml-auto max-w-[70%]">
          <Skeleton class="h-14 w-56 rounded-2xl rounded-tr-sm" />
        </div>
        <div class="flex items-start mr-auto max-w-[70%]">
          <Skeleton class="h-12 w-36 rounded-2xl rounded-tl-sm" />
        </div>
      </div>
      <div class="p-4 border-t border-primary/10 flex gap-2">
        <Skeleton class="h-12 flex-1 rounded-2xl" />
        <Skeleton class="size-12 rounded-2xl shrink-0" />
      </div>
    </div>

    <div
      v-else
      class="h-full flex flex-col min-h-0 overflow-hidden"
    >
      <!-- Header -->
      <div class="shrink-0 px-6 py-4 border-b border-primary/10 flex items-center gap-3">
        <NuxtLink to="/chat">
          <Button
            variant="ghost"
            size="icon"
            class="size-10 rounded-xl hover:bg-secondary transition-colors"
          >
            <Icon name="lucide:arrow-left" size="20" />
          </Button>
        </NuxtLink>
            <div class="min-w-0">
          <p class="text-base font-black text-primary truncate">
            {{ matchDisplayName }}
          </p>
          <div class="flex items-center gap-1.5">
            <span
              class="size-2 rounded-full"
              :class="isMatchOnline ? 'bg-green-500' : 'bg-slate-400'"
            />
            <p
              v-if="isMatchOnline"
              class="text-[10px] font-bold text-green-600 uppercase tracking-widest"
            >
              Online
            </p>
            <p
              v-else-if="matchLastActiveAt"
              class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
            >
              {{ timeAgo(matchLastActiveAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <ScrollArea ref="scrollAreaRef" class="flex-1 min-h-0">
        <div class="p-4 space-y-1">
          <Button
            v-if="hasMore"
            variant="ghost"
            size="sm"
            class="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 hover:text-primary transition-colors"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            {{ isLoadingMore ? "..." : "Load older messages" }}
          </Button>

          <div
            v-if="messages.length === 0 && !hasMore"
            class="flex flex-col items-center text-center gap-3 py-16"
          >
            <div class="size-14 rounded-2xl bg-secondary/60 flex items-center justify-center">
              <Icon name="lucide:hand" size="24" class="text-muted-foreground/60" />
            </div>
            <p class="text-sm font-bold text-muted-foreground max-w-[200px]">
              No messages yet. Say hi!
            </p>
            <div class="flex flex-col gap-2 w-full max-w-[240px] pt-2">
              <button
                v-for="line in icebreakers"
                :key="line"
                type="button"
                class="rounded-2xl border border-primary/10 bg-secondary/50 hover:bg-accent/15 hover:border-accent/30 text-primary font-bold text-xs px-4 py-2.5 transition-colors text-left"
                @click="useIcebreaker(line)"
              >
                {{ line }}
              </button>
            </div>
          </div>

          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="[
              'max-w-[85%] min-w-0 flex flex-col',
              msg.senderId === currentUserId
                ? 'ml-auto items-end'
                : 'mr-auto items-start',
            ]"
          >
            <div
              :class="[
                'px-5 py-2 text-sm font-bold shadow-sm whitespace-pre-wrap break-all',
                msg.senderId === currentUserId
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                  : 'bg-secondary text-primary rounded-2xl rounded-tl-sm',
              ]"
            >
              {{ msg.content }}
            </div>
            <p
              class="text-[9px] font-black text-muted-foreground/40 mt-1 uppercase tracking-tighter"
            >
              {{ formatTime(msg.createdAt) }}
            </p>
          </div>
        </div>
      </ScrollArea>

      <!-- Input -->
      <div class="p-4 bg-white border-t border-primary/10">
        <form class="flex gap-2" @submit.prevent="handleSend">
          <Input
            v-model="newMessage"
            placeholder="Type a message..."
            class="flex-1 h-12 rounded-2xl bg-secondary/50 border-primary/10 font-bold text-sm focus:ring-accent/40"
            :disabled="!isConnected"
          />
          <Button
            type="submit"
            size="icon"
            class="size-12 rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-transform"
            :disabled="!canSend"
          >
            <Icon name="mingcute:send-fill" size="20" class="text-accent" />
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
