<script setup lang="ts">
definePageMeta({ layout: "internal", middleware: "auth" });

type NextCursor = {
  updatedAt: Date;
  id: string;
} | null;

type BrowseProfile = {
  displayName: string;
  id: string;
  major: string;
  photoUrl: string;
};

type BrowseProfilesResponse = {
  profiles: BrowseProfile[];
  nextCursor: NextCursor;
};

const isLoading = ref(true);
const browseProfiles = ref<BrowseProfile[]>([]);

const {
  public: { apiBase },
} = useRuntimeConfig();

const fetchBrowseProfiles = async () => {
  const data = await $fetch<BrowseProfilesResponse>(`${apiBase}/browse`, {
    credentials: "include",
  });

  browseProfiles.value = data.profiles;
  isLoading.value = false;
};

onMounted(async () => {
  await fetchBrowseProfiles();
});
</script>

<template>
  <div class="h-full">
    <!-- TODOO: Implement skeleton íntead of this -->
    <div v-if="isLoading">
      <div>Loading</div>
    </div>

    <div v-else class="h-full flex flex-col">
      <div
        class="p-5 pb-4 pl-6 border-b border-primary/5 flex items-center justify-between"
      >
        <h1 class="text-xl font-black text-primary flex items-center gap-2">
          Browse
        </h1>
        <!-- TODOO: Implement filter here -->
        <Button
          variant="outline"
          class="rounded-xl h-9 px-4 font-bold border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Filter
        </Button>
      </div>
      <ScrollArea class="flex-1 min-h-0">
        <!-- TODOO: Implement /browse/id -->
        <div class="grid grid-cols-2 p-5 gap-5">
          <NuxtLink
            v-for="browseProfile in browseProfiles"
            :key="browseProfile.id"
            :to="`/browse/${browseProfile.id}`"
          >
            <div
              class="p-3 rounded-md bg-secondary/30 hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-primary/5"
            >
              <img
                v-if="browseProfile.photoUrl"
                :src="browseProfile.photoUrl"
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
              
              <div class="font-bold pt-1 truncate">{{ browseProfile.displayName }}</div>
              <div class="text-sm truncate">{{ browseProfile.major }}</div>
            </div>
          </NuxtLink>
        </div>
      </ScrollArea>
    </div>
  </div>
</template>
