<script setup lang="ts">
import { ScrollArea } from "@/components/ui/scroll-area";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import { cn } from "~/lib/utils";
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
  goalOptions,
} from "~/data/profileOptions";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

type NextCursor = {
  updatedAt: Date;
  id: string;
};

type DiscoverProfile = {
  id: string;
  userId: number;
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

const hasActiveFilters = computed(
  () =>
    !!filterMajor.value ||
    !!filterYear.value ||
    filterInterests.value.length > 0,
);

const toggleFilterInterest = (interest: string) => {
  const idx = filterInterests.value.indexOf(interest);
  if (idx === -1) {
    filterInterests.value.push(interest);
  } else {
    filterInterests.value.splice(idx, 1);
  }
};

const yearLabel = (value: string) =>
  yearOptions.find((y) => y.value === value)?.label ?? value;

const majorLabel = (value: string) =>
  majorOptions.flatMap((g) => g.items).find((i) => i.value === value)?.label ??
  value;

const goalLabel = (id: string) =>
  goalOptions.find((g) => g.id === id)?.label ?? id;

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

const startingChatWith = ref<number | null>(null);

const startChat = async (targetUserId: number) => {
  if (startingChatWith.value) return;
  startingChatWith.value = targetUserId;

  try {
    const { match } = await $fetch<{ match: { id: number } }>(
      `${apiBase}/matches/${targetUserId}`,
      { method: "POST", credentials: "include" },
    );
    await navigateTo(`/chat/${match.id}`);
  } catch {
    toast.error("Couldn't start the chat. Try again.");
  } finally {
    startingChatWith.value = null;
  }
};

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

const fieldClass =
  "h-11 w-full rounded-2xl border-primary/10 bg-secondary/50 px-3.5 font-bold text-sm";

function pillClass(active: boolean) {
  return cn(
    "border transition-all duration-200",
    active
      ? "bg-accent/15 border-accent/40 text-primary shadow-sm"
      : "bg-secondary/50 border-primary/10 text-muted-foreground hover:bg-secondary/70",
  );
}

const tagClass = "bg-accent/15 border-accent/30 text-primary font-bold";
</script>

<template>
  <div class="h-full">
    <div class="h-full flex flex-col">
      <div
        class="shrink-0 px-6 pt-6 pb-4 border-b border-primary/10 flex items-center justify-between relative z-20"
      >
        <h1 class="text-xl font-black tracking-tight text-primary">
          Discover
        </h1>
        <Button
          variant="outline"
          class="relative rounded-2xl h-10 px-4 font-black text-sm gap-1.5 border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
          @click="filterIsOpen = !filterIsOpen"
        >
          <Icon name="lucide:sliders-horizontal" size="14" />
          Filter
          <span
            v-if="hasActiveFilters"
            class="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent ring-2 ring-card"
          />
        </Button>

        <Transition name="filter-panel">
          <div
            v-if="filterIsOpen"
            class="absolute top-full left-0 right-0 p-4 z-20 bg-card rounded-b-xl border-x border-b border-primary/10 shadow-md"
          >
            <div class="space-y-3">
              <Select v-model="filterMajor">
                <SelectTrigger :class="cn(fieldClass, 'justify-between')">
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
                <SelectTrigger :class="cn(fieldClass, 'justify-between')">
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
                  <AccordionTrigger
                    class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 py-2 px-0.5 hover:no-underline"
                  >
                    More
                  </AccordionTrigger>
                  <AccordionContent>
                    <div class="max-h-48 overflow-y-auto space-y-3 pr-1">
                      <div
                        v-for="category in interestCategories"
                        :key="category.id"
                      >
                        <div
                          class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 pt-1 pb-1.5"
                        >
                          {{ category.label }}
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                          <Badge
                            v-for="interest in category.options"
                            :key="interest"
                            class="cursor-pointer select-none rounded-full font-bold"
                            :class="pillClass(filterInterests.includes(interest))"
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
                  class="flex-1 h-11 rounded-2xl font-black border-primary/10"
                  @click="clearFilters"
                >
                  Clear
                </Button>
                <Button
                  class="flex-1 h-11 rounded-2xl font-black shadow-lg shadow-primary/10"
                  @click="applyFilters"
                >
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
          <div v-for="n in 6" :key="n" class="grid grid-cols-2 p-6 gap-4">
            <Skeleton class="w-full aspect-square rounded-2xl" />
            <Skeleton class="w-full aspect-square rounded-2xl" />
            <Skeleton class="h-4 w-3/4 mt-2 rounded-full" />
            <Skeleton class="h-4 w-3/4 mt-1 rounded-full" />
            <Skeleton class="h-3 w-1/2 mt-2 rounded-full" />
            <Skeleton class="h-3 w-1/2 mt-1 rounded-full" />
          </div>
        </div>

        <!-- Profiles grid -->
        <ScrollArea v-else ref="scrollAreaRef" class="h-full">
          <TransitionGroup
            tag="div"
            name="discover-profile"
            class="grid grid-cols-2 gap-4 p-6"
          >
            <!-- If no profiles found -->
            <div
              v-if="discoverProfiles.length === 0"
              key="empty"
              class="col-span-2 flex flex-col items-center justify-center gap-3 py-24 text-center"
            >
              <div class="size-14 rounded-2xl bg-secondary/60 flex items-center justify-center">
                <Icon name="lucide:users" size="24" class="text-muted-foreground/60" />
              </div>
              <p class="text-sm font-bold text-muted-foreground max-w-[200px]">
                {{
                  hasActiveFilters
                    ? "No profiles found matching your filters."
                    : "No public profiles found yet."
                }}
              </p>
              <Button
                v-if="hasActiveFilters"
                variant="outline"
                class="rounded-2xl h-9 px-4 font-black text-xs border-primary/10"
                @click="clearFilters"
              >
                Clear filters
              </Button>
            </div>

            <div
              v-for="discoverProfile in discoverProfiles"
              v-else
              :key="discoverProfile.id"
            >
            <Dialog>
              <DialogTrigger as-child>
                <div
                  class="group px-3 py-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 hover:border-accent/30 hover:shadow-md hover:shadow-primary/10 transition-all duration-300 cursor-pointer border border-primary/10"
                >
                  <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-secondary/60 shadow-sm">
                    <img
                      v-if="discoverProfile.photoUrl"
                      :src="discoverProfile.photoUrl"
                      alt="Profile"
                      class="w-full h-full object-cover transition-transform duration-500"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <Icon
                        name="lucide:user"
                        size="32"
                        class="text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <div class="font-black text-sm truncate pt-2 px-0.5 text-primary group-hover:text-accent transition-colors">
                    {{ discoverProfile.displayName }}
                  </div>
                  <div class="text-xs font-bold text-muted-foreground truncate px-0.5">
                    {{ majorLabel(discoverProfile.major) }}
                  </div>
                </div>
              </DialogTrigger>
              <!-- Profile popup -->
              <DialogContent
                to="#app-shell-portal"
                class="w-[calc(100%-2.5rem)] rounded-2xl bg-card border-primary/10 gap-5"
              >
                <DialogHeader>
                  <div class="flex items-center gap-3">
                    <img
                      v-if="discoverProfile.photoUrl"
                      :src="discoverProfile.photoUrl"
                      alt="Profile"
                      class="size-16 rounded-2xl object-cover shadow-sm shrink-0"
                    />
                    <div
                      v-else
                      class="size-16 rounded-2xl bg-secondary/60 flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <Icon
                        name="lucide:user"
                        size="28"
                        class="text-muted-foreground/50"
                      />
                    </div>
                    <div class="min-w-0">
                      <DialogTitle class="truncate font-black text-lg">
                        {{ discoverProfile.displayName }}
                      </DialogTitle>
                      <DialogDescription class="truncate font-bold">
                        {{ majorLabel(discoverProfile.major) }} ·
                        {{ yearLabel(discoverProfile.year) }}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <p
                  v-if="discoverProfile.bio"
                  class="text-sm text-muted-foreground font-medium leading-relaxed"
                >
                  {{ discoverProfile.bio }}
                </p>

                <div
                  v-if="discoverProfile.goals.length > 0"
                  class="space-y-1.5"
                >
                  <div class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Looking for
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <Badge
                      v-for="goal in discoverProfile.goals"
                      :key="goal"
                      :class="tagClass"
                    >
                      {{ goalLabel(goal) }}
                    </Badge>
                  </div>
                </div>

                <div
                  v-if="discoverProfile.vibes.length > 0"
                  class="space-y-1.5"
                >
                  <div class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Vibes
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <Badge
                      v-for="vibe in discoverProfile.vibes"
                      :key="vibe"
                      :class="tagClass"
                    >
                      {{ vibe }}
                    </Badge>
                  </div>
                </div>

                <div
                  v-if="discoverProfile.interests.length > 0"
                  class="space-y-1.5"
                >
                  <div class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Interests
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <Badge
                      v-for="interest in discoverProfile.interests"
                      :key="interest"
                      :class="tagClass"
                    >
                      {{ interest }}
                    </Badge>
                  </div>
                </div>

                <Button
                  class="w-full h-12 rounded-2xl font-black gap-2 shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform active:scale-95"
                  :disabled="startingChatWith === discoverProfile.userId"
                  @click="startChat(discoverProfile.userId)"
                >
                  <template v-if="startingChatWith === discoverProfile.userId">
                    <Icon name="svg-spinners:ring-resize" size="16" class="text-accent" />
                  </template>
                  <template v-else>
                    <Icon name="lucide:message-circle" size="16" class="text-accent" />
                    Chat
                  </template>
                </Button>
              </DialogContent>
            </Dialog>
            </div>
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
            class="absolute inset-0 z-10 bg-black/25"
            @click="filterIsOpen = false"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>
