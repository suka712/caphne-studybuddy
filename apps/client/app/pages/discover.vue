<script setup lang="ts">
import { ScrollArea } from "@/components/ui/scroll-area";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import {
  majorOptions,
  yearOptions,
  interestCategories,
} from "~/data/startOptions";

definePageMeta({ layout: "internal", middleware: "auth" });

type NextCursor = {
  updatedAt: Date;
  id: string;
};

type DiscoverProfile = {
  id: string;
  displayName: string;
  major: string;
  bio: string;
  gender: string;
  year: string;
  photoUrl: string | null;
  goals: string[];
  vibes: string[];
  interests: string[];
};

type DiscoverProfilesResponse = {
  profiles: DiscoverProfile[];
  nextCursor: NextCursor;
};

const isLoadingInitialProfiles = ref(true);
const isLoadingMoreProfiles = ref(false);
const discoverProfiles = ref<DiscoverProfile[]>([]);
const nextCursor = ref<NextCursor | null>(null);

const filterIsOpen = ref(false);
const filterMajor = ref<string | undefined>(undefined);
const filterYear = ref<string | undefined>(undefined);
const filterInterests = ref<string[]>([]);

const toggleFilterInterest = (interest: string) => {
  const idx = filterInterests.value.indexOf(interest);
  if (idx === -1) {
    filterInterests.value.push(interest);
  } else {
    filterInterests.value.splice(idx, 1);
  }
};

const activeFilterQuery = () => ({
  ...(filterMajor.value ? { major: filterMajor.value } : {}),
  ...(filterYear.value ? { year: filterYear.value } : {}),
  ...(filterInterests.value.length > 0
    ? { interests: filterInterests.value }
    : {}),
});

const LOADING_DELAY_MS = 2000;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const {
  public: { apiBase },
} = useRuntimeConfig();

const fetchInitialProfiles = async () => {
  const data = await $fetch<DiscoverProfilesResponse>(`${apiBase}/discover`, {
    credentials: "include",
    query: activeFilterQuery(),
  });

  discoverProfiles.value = data.profiles;
  nextCursor.value = data.nextCursor;
  isLoadingInitialProfiles.value = false;
};

const fetchMoreProfiles = async () => {
  if (isLoadingMoreProfiles.value) return;
  if (discoverProfiles.value.length > 0 && !nextCursor.value) return;

  isLoadingMoreProfiles.value = true;

  const query = {
    ...activeFilterQuery(),
    ...(nextCursor.value
      ? {
          updatedAt: String(nextCursor.value.updatedAt),
          id: nextCursor.value.id,
        }
      : {}),
  };

  const [data] = await Promise.all([
    $fetch<DiscoverProfilesResponse>(`${apiBase}/discover`, {
      credentials: "include",
      query,
    }),
    delay(LOADING_DELAY_MS),
  ]);

  discoverProfiles.value = [...discoverProfiles.value, ...data.profiles];
  nextCursor.value = data.nextCursor;
  isLoadingMoreProfiles.value = false;
};

const applyFilters = async () => {
  filterIsOpen.value = false;
  isLoadingInitialProfiles.value = true;
  discoverProfiles.value = [];
  nextCursor.value = null;
  await fetchInitialProfiles();
};

const clearFilters = () => {
  filterMajor.value = undefined;
  filterYear.value = undefined;
  filterInterests.value = [];
  applyFilters();
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
    <div class="h-full flex flex-col">
      <div
        class="p-5 pb-4 pl-6 border-b border-primary/5 flex items-center justify-between relative z-20"
      >
        <h1 class="text-xl font-black text-primary flex items-center gap-2">
          Discover
        </h1>
        <Button
          variant="outline"
          class="rounded-xl h-9 px-4 font-bold border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
          @click="filterIsOpen = !filterIsOpen"
        >
          Filter
        </Button>

        <Transition name="filter-panel">
          <div
            v-if="filterIsOpen"
            class="absolute top-full left-0 right-0 p-3 z-20 bg-white rounded-b-xl border-x border-b border-primary/5 shadow-md"
          >
            <div class="space-y-3">
              <Select v-model="filterMajor">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Any major" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup v-for="group in majorOptions" :key="group.group">
                    <SelectLabel>{{ group.group }}</SelectLabel>
                    <SelectItem
                      v-for="item in group.items"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select v-model="filterYear">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Any year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in yearOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Accordion type="single" collapsible>
                <AccordionItem value="more" class="border-b-0">
                  <AccordionTrigger class="text-xs font-bold text-muted-foreground py-2 px-3">
                    More
                  </AccordionTrigger>
                  <AccordionContent>
                    <div class="max-h-48 overflow-y-auto space-y-2 pr-1">
                      <div v-for="category in interestCategories" :key="category.id">
                        <div
                          class="text-[11px] font-bold text-muted-foreground/70 pt-1"
                        >
                          {{ category.label }}
                        </div>
                        <div class="flex flex-wrap gap-1.5 pt-1">
                          <Badge
                            v-for="interest in category.options"
                            :key="interest"
                            :variant="
                              filterInterests.includes(interest)
                                ? 'default'
                                : 'outline'
                            "
                            class="cursor-pointer select-none"
                            @click="toggleFilterInterest(interest)"
                          >
                            {{ interest }}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div class="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  class="flex-1 rounded-xl"
                  @click="clearFilters"
                >
                  Clear
                </Button>
                <Button class="flex-1 rounded-xl" @click="applyFilters">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div class="relative flex-1 min-h-0">
        <!-- Skeleton -->
        <div v-if="isLoadingInitialProfiles">
          <div v-for="n in 6" :key="n" class="grid grid-cols-2 p-5 gap-5">
            <Skeleton class="w-full aspect-square rounded-sm" />
            <Skeleton class="w-full aspect-square rounded-sm" />
            <Skeleton class="h-4 w-3/4 mt-2" />
            <Skeleton class="h-4 w-3/4 mt-1" />
            <Skeleton class="h-3 w-1/2 mt-2" />
            <Skeleton class="h-3 w-1/2 mt-1" />
          </div>
        </div>

        <!-- Profiles grid -->
        <ScrollArea v-else ref="scrollAreaRef" class="h-full">
        <!-- TODOO: Implement discover popup -->
        <TransitionGroup
          tag="div"
          name="discover-profile"
          class="grid grid-cols-2 p-5 gap-5"
        >
          <Dialog
            v-for="discoverProfile in discoverProfiles"
            :key="discoverProfile.id"
          >
            <DialogTrigger as-child>
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
            </DialogTrigger>
            <!-- Dialog popup -->
            <DialogContent class="w-xs">
              <DialogHeader>
                <DialogTitle>{{ discoverProfile.displayName }}</DialogTitle>
                <DialogDescription>
                  {{ discoverProfile.bio }}
                </DialogDescription>
              </DialogHeader>
              <div v-for="vibe in discoverProfile.vibes" :key="vibe">
                {{ vibe }}
              </div>
            </DialogContent>
          </Dialog>
        </TransitionGroup>
        <!-- Loading indicator -->
        <Transition name="bouncing-dots">
          <div v-if="isLoadingMoreProfiles" class="flex justify-center pb-5">
            <Icon
              name="svg-spinners:3-dots-bounce"
              size="28"
              class="text-muted-foreground"
            />
          </div>
        </Transition>
        </ScrollArea>

        <Transition name="backdrop">
          <div
            v-if="filterIsOpen"
            class="absolute inset-0 z-10 bg-black/40"
            @click="filterIsOpen = false"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>
