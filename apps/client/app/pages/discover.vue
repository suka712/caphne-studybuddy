<script setup lang="ts">
import { ScrollArea } from "@/components/ui/scroll-area";

definePageMeta({ layout: "internal", middleware: "auth" });

type NextCursor = {
  updatedAt: Date;
  id: string;
};

type DiscoverProfile = {
  displayName: string;
  id: string;
  major: string;
  photoUrl: string;
};

type DiscoverProfilesResponse = {
  profiles: DiscoverProfile[];
  nextCursor: NextCursor;
};

const isLoadingInitialProfiles = ref(true);
const isLoadingMoreProfiles = ref(false);
const discoverProfiles = ref<DiscoverProfile[]>([]);
const nextCursor = ref<NextCursor | null>(null);

const {
  public: { apiBase },
} = useRuntimeConfig();

const fetchInitialProfiles = async () => {
  const data = await $fetch<DiscoverProfilesResponse>(`${apiBase}/discover`, {
    credentials: "include",
  });

  discoverProfiles.value = data.profiles;
  nextCursor.value = data.nextCursor;
  isLoadingInitialProfiles.value = false;
};

const fetchMoreProfiles = async () => {
  if (isLoadingMoreProfiles.value) return;
  if (discoverProfiles.value.length > 0 && !nextCursor.value) return;
  
  isLoadingMoreProfiles.value = true;

  const query = nextCursor.value
    ? {
        updatedAt: String(nextCursor.value.updatedAt),
        id: nextCursor.value.id,
      }
    : {};

  const data = await $fetch<DiscoverProfilesResponse>(`${apiBase}/discover`, {
    credentials: "include",
    query,
  });

  discoverProfiles.value = [...discoverProfiles.value, ...data.profiles];
  nextCursor.value = data.nextCursor;
  isLoadingMoreProfiles.value = false;
};

const onScroll = (e: Event) => {
  const el = e.target as HTMLElement;
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
  if (nearBottom) fetchMoreProfiles();
};

const scrollAreaRef = ref<InstanceType<typeof ScrollArea> | null>(null);

onMounted(async () => {
  await fetchInitialProfiles();

  const viewport = scrollAreaRef.value?.$el?.querySelector(
    '[data-slot="scroll-area-viewport"]',
  );
  viewport?.addEventListener("scroll", onScroll);
});
</script>

<template>
  <div class="h-full">
    <!-- TODOO: Implement skeleton íntead of this -->
    <div v-if="isLoadingInitialProfiles">
      <div>Loading</div>
    </div>

    <div v-else class="h-full flex flex-col">
      <div
        class="p-5 pb-4 pl-6 border-b border-primary/5 flex items-center justify-between"
      >
        <h1 class="text-xl font-black text-primary flex items-center gap-2">
          Discover
        </h1>
        <!-- TODOO: Implement filter here -->
        <Button
          variant="outline"
          class="rounded-xl h-9 px-4 font-bold border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Filter
        </Button>
      </div>
      <ScrollArea ref="scrollAreaRef" class="flex-1 min-h-0">
        <!-- TODOO: Implement discover popup -->
        <div class="grid grid-cols-2 p-5 gap-5">
          <NuxtLink
            v-for="discoverProfile in discoverProfiles"
            :key="discoverProfile.id"
            :to="`/discover`"
          >
            <div
              class="p-3 rounded-md bg-secondary/30 hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-primary/5"
            >
              <img
                v-if="discoverProfile.photoUrl"
                :src="discoverProfile.photoUrl"
                alt="Profile"
                class="rounded-sm shadow-md w-full aspect-square object-cover"
              />
              <div v-else class="relative w-full aspect-square">
                <Icon
                  name="mdi:account"
                  size="50"
                  class="absolute inset-0 m-auto"
                />
              </div>

              <div class="font-bold pt-1 truncate">
                {{ discoverProfile.displayName }}
              </div>
              <div class="text-sm truncate">{{ discoverProfile.major }}</div>
            </div>
          </NuxtLink>
        </div>
      </ScrollArea>
    </div>
  </div>
</template>
