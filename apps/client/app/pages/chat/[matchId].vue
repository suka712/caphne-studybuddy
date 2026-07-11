<script setup lang="ts">
import { toast } from "vue-sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "~/types/chat";

definePageMeta({
  middleware: "auth",
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
      navigateTo("/matches");
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
    navigateTo("/matches");
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
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
    </div>

    <div
      v-else
      class="h-full flex flex-col min-h-0 overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 border-b border-primary/5 flex items-center gap-2">
        <NuxtLink to="/matches">
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
            class="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            {{ isLoadingMore ? "..." : "Load older messages" }}
          </Button>

          <p
            v-if="messages.length === 0 && !hasMore"
            class="text-muted-foreground text-sm text-center py-12 font-bold italic"
          >
            No messages yet. Say hi!
          </p>

          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="[
              'max-w-[85%] flex flex-col',
              msg.senderId === currentUserId
                ? 'ml-auto items-end'
                : 'mr-auto items-start',
            ]"
          >
            <div
              :class="[
                'px-5 py-2 text-sm font-bold shadow-sm',
                msg.senderId === currentUserId
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none'
                  : 'bg-secondary text-primary rounded-2xl rounded-tl-none',
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
      <div class="p-4 bg-background/50 border-t border-primary/5">
        <form class="flex gap-2" @submit.prevent="handleSend">
          <Input
            v-model="newMessage"
            placeholder="Type a message..."
            class="flex-1 h-12 rounded-xl bg-background border-primary/5 font-bold text-sm focus:ring-accent/20"
            :disabled="!isConnected"
          />
          <Button
            type="submit"
            size="icon"
            class="size-12 rounded-xl shadow-lg shadow-primary/10 active:scale-95 transition-transform"
            :disabled="!canSend"
          >
            <Icon name="mingcute:send-fill" size="20" class="text-accent" />
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
