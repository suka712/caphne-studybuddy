<script setup lang="ts">
import { toast } from "vue-sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  goalOptions,
  interestCategories,
  majorOptions,
  vibeOptions,
  yearOptions,
} from "~/data/profileOptions";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

const { authUser, logout } = useAuth();
const { isCheckingProfile, profile } = useProfile();
const { saveProfileField } = useProfileFieldSave();

// ---- Interests: the one field that stays bespoke - category grouping +
// freeform custom tags don't fit the generic options-list chips component. ----
const allCategoryOptions = interestCategories.flatMap((c) => c.options);

const editingInterests = ref(false);
const draftInterests = ref<string[]>([]);
const customTag = ref("");
const customTags = ref<string[]>([]);

const startEditingInterests = () => {
  draftInterests.value = [...(profile.value?.interests ?? [])];
  customTags.value = draftInterests.value.filter(
    (i) => !allCategoryOptions.includes(i),
  );
  customTag.value = "";
  editingInterests.value = true;
};

const cancelEditingInterests = () => {
  editingInterests.value = false;
  draftInterests.value = [];
  customTags.value = [];
  customTag.value = "";
};

const toggleInterest = (value: string) => {
  draftInterests.value = draftInterests.value.includes(value)
    ? draftInterests.value.filter((v) => v !== value)
    : [...draftInterests.value, value];
};

const addCustomTag = () => {
  const tag = customTag.value.trim();
  if (tag && !draftInterests.value.includes(tag)) {
    customTags.value = [...customTags.value, tag];
    draftInterests.value = [...draftInterests.value, tag];
    customTag.value = "";
  }
};

const removeCustomTag = (tag: string) => {
  customTags.value = customTags.value.filter((t) => t !== tag);
  draftInterests.value = draftInterests.value.filter((i) => i !== tag);
};

const saveInterests = async () => {
  if (draftInterests.value.length === 0) {
    toast.error("Select at least one interest");
    return;
  }
  const ok = await saveProfileField({ interests: [...draftInterests.value] });
  if (ok) cancelEditingInterests();
};

// ---- Option shapes for the extracted field components ----
const goalChipOptions = goalOptions.map((g) => ({ value: g.id, label: g.label }));
const vibeChipOptions = vibeOptions.map((v) => ({ value: v, label: v }));
const genderSelectGroups = [
  {
    group: null,
    items: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
  },
];
const yearSelectGroups = [{ group: null, items: yearOptions }];
// majorOptions already matches the { group, items } shape FieldSelect expects.

const togglePublic = async (checked: boolean) => {
  await saveProfileField(
    { isPublic: checked },
    {
      successMessage: checked ? "Profile is now public" : "Profile is now private",
      errorMessage: "Failed to update visibility",
    },
  );
};

const toggleNotifications = async (checked: boolean) => {
  await saveProfileField(
    { notificationsEnabled: checked },
    {
      successMessage: checked ? "Notifications enabled" : "Notifications muted",
      errorMessage: "Failed to update notification preference",
    },
  );
};

const handleLogout = async () => {
  await logout();
  navigateTo("/");
};
</script>

<template>
  <div class="h-full">
    <div v-if="isCheckingProfile" class="h-full flex flex-col">
      <div class="shrink-0 flex items-center gap-3 p-6 border-b border-primary/10">
        <Skeleton class="size-14 rounded-2xl shrink-0" />
        <div class="space-y-2 overflow-hidden flex-1">
          <Skeleton class="h-5 w-36 rounded-md" />
          <Skeleton class="h-4 w-48 rounded-md" />
        </div>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
        <div v-for="i in 3" :key="i" class="space-y-2">
          <Skeleton class="h-3 w-24 rounded-md" />
          <Skeleton class="h-12 w-full rounded-2xl" />
        </div>
        <div class="border-t border-primary/30" />
        <div v-for="i in 2" :key="'chip-' + i" class="space-y-2">
          <Skeleton class="h-3 w-20 rounded-md" />
          <div class="flex gap-2">
            <Skeleton class="h-8 w-20 rounded-full" />
            <Skeleton class="h-8 w-24 rounded-full" />
            <Skeleton class="h-8 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="profile" class="h-full flex flex-col">
      <!-- Header -->
      <div class="shrink-0 flex items-center gap-3 p-6 border-b border-primary/10">
        <div
          class="size-14 rounded-2xl bg-secondary/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
        >
          <img
            v-if="profile?.photoUrl"
            :src="profile?.photoUrl"
            class="w-full h-full object-cover"
          />
          <Icon v-else name="lucide:user" size="26" class="text-muted-foreground/50" />
        </div>
        <div class="overflow-hidden">
          <h1 class="font-black tracking-tight text-primary truncate">
            {{ profile.displayName }}
          </h1>
          <p class="text-muted-foreground text-sm font-bold truncate">
            {{ authUser?.email }}
          </p>
        </div>
      </div>

      <!-- Editable Fields -->
      <div class="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
        <EditableText
          label="Display Name"
          field-key="displayName"
          :value="profile.displayName"
          placeholder="Enter your name"
          :validate="(v) => (!v || v.length < 2) ? 'Name must be at least 2 characters' : null"
        />

        <EditableText
          label="Photo URL"
          field-key="photoUrl"
          :value="profile.photoUrl"
          placeholder="https://example.com/photo.jpg"
          empty-text="Add a photo link"
          allow-empty
          :validate="async (v) => (v && !(await validatePhotoUrl(v))) ? 'Could not load image from this URL' : null"
        />

        <EditableBio label="Bio" :value="profile.bio" :max-length="200" />

        <div class="border-t border-primary/30"/>

        <!-- Show profile publicly -->
        <div class="flex items-center justify-between">
          <label class="text-sm font-bold text-primary">Show profile publicly</label>
          <Switch :checked="profile.isPublic" @update:checked="togglePublic" />
        </div>

        <div class="pt-3 border-t border-primary/30"/>

        <!-- Goals -->
        <EditableChips
          label="Goals"
          field-key="goals"
          :value="profile.goals"
          :options="goalChipOptions"
          empty-text="Add your goals"
        />
        <!-- Vibes -->
        <EditableChips
          label="Vibes"
          field-key="vibes"
          :value="profile.vibes"
          :options="vibeChipOptions"
          empty-text="Add your vibe"
        />
        <!-- Interests (bespoke: category accordion + free-form tags) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <label
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
            >
              Interests
            </label>
            <div class="flex items-center gap-1">
              <template v-if="editingInterests">
                <button
                  type="button"
                  title="Cancel"
                  class="size-7 rounded-lg flex items-center justify-center text-muted-foreground transition-colors hover:bg-secondary/60"
                  @click="cancelEditingInterests"
                >
                  <Icon name="lucide:x" size="17" class="[stroke-width:2.75]" />
                </button>
                <button
                  type="button"
                  title="Save"
                  class="size-7 rounded-lg flex items-center justify-center text-accent transition-colors hover:bg-accent/15"
                  @click="saveInterests"
                >
                  <Icon name="lucide:check" size="17" class="[stroke-width:2.75]" />
                </button>
              </template>
              <button
                v-else
                type="button"
                title="Edit"
                class="size-7 rounded-lg flex items-center justify-center text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-primary"
                @click="startEditingInterests"
              >
                <Icon name="lucide:pencil" size="16" class="[stroke-width:2.75]" />
              </button>
            </div>
          </div>

          <!-- Shown -->
          <div
            v-if="!editingInterests"
            class="min-h-12 flex flex-wrap gap-2 rounded-xl border border-primary/10 bg-secondary/50 px-3 py-2.5"
          >
            <Badge
              v-for="interest in profile.interests"
              :key="interest"
              class="px-3 py-1.5 text-sm font-bold rounded-full bg-accent/15 border-accent/30 text-primary"
            >
              {{ interest }}
            </Badge>
            <span
              v-if="profile.interests.length === 0"
              class="text-sm font-medium italic text-muted-foreground/60"
            >
              Add your interests
            </span>
          </div>

          <!-- Editing -->
          <div
            v-else
            class="rounded-xl border border-primary/10 bg-secondary/50 px-3 py-2.5 space-y-3"
          >
            <Accordion type="multiple" class="w-full" :default-value="['academic']">
              <AccordionItem
                v-for="category in interestCategories"
                :key="category.id"
                :value="category.id"
                class="border-primary/10"
              >
                <AccordionTrigger class="hover:no-underline font-bold">
                  <div class="flex items-center gap-2">
                    <Icon :name="category.icon" size="16" class="text-accent" />
                    <span>{{ category.label }}</span>
                    <Badge
                      v-if="
                        draftInterests.filter((i) => category.options.includes(i))
                          .length > 0
                      "
                      class="ml-1 text-xs bg-accent/15 text-primary border-none"
                    >
                      {{
                        draftInterests.filter((i) => category.options.includes(i))
                          .length
                      }}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="flex flex-wrap gap-2 pt-2 pb-1">
                    <Badge
                      v-for="option in category.options"
                      :key="option"
                      variant="outline"
                      class="cursor-pointer px-3 py-1.5 text-sm font-bold rounded-full transition-all duration-200 hover:scale-105"
                      :class="
                        draftInterests.includes(option)
                          ? 'bg-accent/15 border-accent/30 text-primary'
                          : 'bg-secondary/50 border-primary/10 text-muted-foreground hover:bg-secondary/70'
                      "
                      @click="toggleInterest(option)"
                    >
                      {{ option }}
                    </Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <!-- Free-form tags -->
            <div class="pt-3 border-t border-primary/10">
              <label
                class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
              >
                Add your own tags
              </label>
              <div class="flex gap-2 mt-2.5 mb-3">
                <input
                  v-model="customTag"
                  placeholder="Type a tag..."
                  class="flex-1 min-w-0 h-10 px-3 rounded-xl bg-background border border-primary/10 outline-none font-bold text-sm placeholder:text-muted-foreground/50 placeholder:font-medium focus-visible:ring-2 focus-visible:ring-accent/40"
                  @keyup.enter="addCustomTag"
                />
                <button
                  type="button"
                  class="h-10 w-10 rounded-xl border border-primary/10 bg-background flex items-center justify-center shrink-0 hover:bg-secondary/40 transition-colors"
                  @click="addCustomTag"
                >
                  <Icon name="lucide:plus" size="16" />
                </button>
              </div>
              <div v-if="customTags.length > 0" class="flex flex-wrap gap-2">
                <Badge
                  v-for="tag in customTags"
                  :key="tag"
                  class="px-3 py-1.5 text-sm font-bold rounded-full bg-accent/15 border-accent/30 text-primary flex items-center gap-1.5"
                >
                  {{ tag }}
                  <Icon
                    name="lucide:x"
                    size="12"
                    class="cursor-pointer hover:text-destructive"
                    @click="removeCustomTag(tag)"
                  />
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-primary/30"/>

        <!-- More details: fields that almost never change once set -->
        <Accordion type="single" collapsible>
          <AccordionItem value="more-details" class="border-primary/10">
            <AccordionTrigger
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground/90 hover:no-underline py-2"
            >
              More details
            </AccordionTrigger>
            <AccordionContent>
              <div class="space-y-5 pt-3">
                <FieldSelect
                  label="Gender"
                  field-key="gender"
                  :value="profile.gender"
                  placeholder="Select your gender"
                  :groups="genderSelectGroups"
                />

                <FieldDatePicker label="Birthday" field-key="birthday" :value="profile.birthday" />

                <FieldSelect
                  label="Year"
                  field-key="year"
                  :value="profile.year"
                  placeholder="Select your year"
                  :groups="yearSelectGroups"
                />

                <FieldSelect
                  label="Major"
                  field-key="major"
                  :value="profile.major"
                  placeholder="Select your major"
                  :groups="majorOptions"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div class="border-t border-primary/30"/>

        <!-- Preferences: notification setting + account actions -->
        <Accordion type="single" collapsible>
          <AccordionItem value="preferences" class="border-primary/10">
            <AccordionTrigger
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground/90 hover:no-underline py-2"
            >
              Preferences
            </AccordionTrigger>
            <AccordionContent>
              <div class="space-y-5 pt-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-bold text-primary">Message notifications</label>
                  <Switch
                    :checked="profile.notificationsEnabled"
                    @update:checked="toggleNotifications"
                  />
                </div>

                <div class="pt-3 border-t border-primary/10">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 text-sm font-bold text-muted-foreground/70 hover:text-destructive transition-colors"
                    @click="handleLogout"
                  >
                    <Icon name="lucide:log-out" size="14" />
                    Log out
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  </div>
</template>
