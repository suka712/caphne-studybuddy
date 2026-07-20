<script setup lang="ts">
import { toast } from "vue-sonner";
import { cn } from "~/lib/utils";
import type { DateValue } from "reka-ui";
import {
  DateFormatter,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const { isCheckingProfile, profile, updateProfile } =
  useProfile();

type EditableField =
  | "displayName"
  | "photoUrl"
  | "bio"
  | "gender"
  | "birthday"
  | "year"
  | "major"
  | "goals"
  | "vibes"
  | "interests";

const editingField = ref<EditableField | null>(null);
// text / single-select fields (name, photo, bio, gender, year, major)
const editingValue = ref("");
// multi-select fields (goals, vibes, interests)
const editingArrayValue = ref<string[]>([]);
// birthday
const editingDate = ref<DateValue>();
// interests custom tags
const customTag = ref("");
const customTags = ref<string[]>([]);

const bioMaxLength = 200;

// Birthday calendar helpers (ported from start.vue)
const defaultPlaceholder = today(getLocalTimeZone());
const df = new DateFormatter("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const genderOptions = [
  { value: "male", label: "Male", icon: "streamline-pixel:user-gender-male" },
  {
    value: "female",
    label: "Female",
    icon: "streamline-pixel:user-gender-female",
  },
  {
    value: "other",
    label: "Other",
    icon: "streamline-pixel:interface-essential-question-help-square",
  },
];

const allCategoryOptions = interestCategories.flatMap((c) => c.options);

// Read-only display helpers (stored value -> human label)
const genderLabel = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not set";
const yearLabel = (value: string) =>
  yearOptions.find((y) => y.value === value)?.label ?? value ?? "Not set";
const majorLabel = (value: string) => {
  for (const group of majorOptions) {
    const item = group.items.find((i) => i.value === value);
    if (item) return item.label;
  }
  return value || "Not set";
};
const goalLabel = (id: string) =>
  goalOptions.find((g) => g.id === id)?.label ?? id;
const birthdayLabel = (value: string | null) => {
  if (!value) return "Not set";
  try {
    return df.format(parseDate(value).toDate(getLocalTimeZone()));
  } catch {
    return value;
  }
};

const selectedTagClass = "bg-accent/10 border-accent/20 text-primary font-bold";
const unselectedTagClass =
  "bg-secondary/20 border-transparent text-muted-foreground hover:bg-secondary/40";

function pillClass(active: boolean) {
  return cn(
    "border transition-all duration-200",
    active ? selectedTagClass : unselectedTagClass,
  );
}

const startEditing = (field: EditableField) => {
  editingField.value = field;
  editingValue.value = "";
  editingArrayValue.value = [];
  editingDate.value = undefined;
  customTag.value = "";
  customTags.value = [];

  if (field === "goals" || field === "vibes" || field === "interests") {
    editingArrayValue.value = [...(profile.value?.[field] ?? [])];
    if (field === "interests") {
      customTags.value = editingArrayValue.value.filter(
        (i) => !allCategoryOptions.includes(i),
      );
    }
  } else if (field === "birthday") {
    editingDate.value = profile.value?.birthday
      ? parseDate(profile.value.birthday)
      : undefined;
  } else {
    editingValue.value = profile.value?.[field] ?? "";
  }
};

const cancelEditing = () => {
  editingField.value = null;
  editingValue.value = "";
  editingArrayValue.value = [];
  editingDate.value = undefined;
  customTag.value = "";
  customTags.value = [];
};

const toggleArrayValue = (value: string) => {
  if (editingArrayValue.value.includes(value)) {
    editingArrayValue.value = editingArrayValue.value.filter(
      (v) => v !== value,
    );
  } else {
    editingArrayValue.value = [...editingArrayValue.value, value];
  }
};

const addCustomTag = () => {
  const tag = customTag.value.trim();
  if (tag && !editingArrayValue.value.includes(tag)) {
    customTags.value = [...customTags.value, tag];
    editingArrayValue.value = [...editingArrayValue.value, tag];
    customTag.value = "";
  }
};

const removeCustomTag = (tag: string) => {
  customTags.value = customTags.value.filter((t) => t !== tag);
  editingArrayValue.value = editingArrayValue.value.filter((i) => i !== tag);
};

const saveField = async () => {
  const field = editingField.value;
  if (!field) return;

  let updates: Record<string, any>;

  if (field === "displayName") {
    const value = editingValue.value.trim();
    if (!value || value.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    updates = { displayName: value };
  } else if (field === "photoUrl") {
    const value = editingValue.value.trim();
    if (value) {
      const isValid = await validatePhotoUrl(value);
      if (!isValid) {
        toast.error("Could not load image from this URL");
        return;
      }
    }
    updates = { photoUrl: value || null };
  } else if (field === "bio") {
    const value = editingValue.value.trim();
    if (value.length > bioMaxLength) {
      toast.error(`Bio must be ${bioMaxLength} characters or less`);
      return;
    }
    updates = { bio: value };
  } else if (field === "gender" || field === "year" || field === "major") {
    const value = editingValue.value;
    if (!value) {
      toast.error("Please make a selection");
      return;
    }
    updates = { [field]: value };
  } else if (field === "birthday") {
    if (!editingDate.value) {
      toast.error("Please select a date");
      return;
    }
    const d = editingDate.value;
    updates = {
      birthday: `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`,
    };
  } else {
    if (editingArrayValue.value.length === 0) {
      toast.error("Please select at least one option");
      return;
    }
    updates = { [field]: [...editingArrayValue.value] };
  }

  try {
    await updateProfile(updates);
    cancelEditing();
    toast.success("Updated");
  } catch {
    toast.error("Failed to update");
  }
};

const togglePublic = async (checked: boolean) => {
  try {
    await updateProfile({ isPublic: checked });
    toast.success(checked ? "Profile is now public" : "Profile is now private");
  } catch {
    toast.error("Failed to update visibility");
  }
};

const toggleNotifications = async (checked: boolean) => {
  try {
    await updateProfile({ notificationsEnabled: checked });
    toast.success(checked ? "Notifications enabled" : "Notifications muted");
  } catch {
    toast.error("Failed to update notification preference");
  }
};

const handleLogout = async () => {
  await logout();
  navigateTo("/");
};

const labelClass =
  "text-[11px] font-black uppercase tracking-widest text-muted-foreground/70";
const fieldClass =
  "rounded-2xl border-primary/10 bg-secondary/20 font-bold text-sm focus-visible:ring-2 focus-visible:ring-accent/40";
const fieldBoxClass = cn(
  fieldClass,
  "w-full flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-secondary/30 hover:border-accent/25 transition-colors",
);
// Same size/shape as the edit-mode chips too, not just the same color -
// px-3 py-1.5 text-sm rounded-full matches the Badge classes used below.
const tagViewClass = cn(selectedTagClass, "px-3 py-1.5 text-sm rounded-full");
// Small confirm/cancel icon buttons that live inside the field itself,
// never as a separate row below it.
const confirmIconClass =
  "shrink-0 size-7 rounded-lg flex items-center justify-center transition-colors";
const saveIconClass = cn(confirmIconClass, "text-accent hover:bg-accent/15");
const cancelIconClass = cn(
  confirmIconClass,
  "text-muted-foreground hover:bg-secondary/60",
);
</script>

<template>
  <div class="h-full">
    <div v-if="isCheckingProfile" class="flex items-center justify-center h-full">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-accent" />
    </div>

    <div v-else-if="profile" class="h-full flex flex-col">
      <!-- Header -->
      <div class="shrink-0 flex items-center gap-3 p-6 border-b border-primary/5">
        <div
          class="size-14 rounded-2xl bg-secondary/40 flex items-center justify-center overflow-hidden shrink-0"
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
        <!-- Display Name -->
        <div class="space-y-1.5">
          <label :class="labelClass">Display Name</label>
          <button
            v-if="editingField !== 'displayName'"
            type="button"
            :class="cn(fieldBoxClass, 'h-12 px-4')"
            @click="startEditing('displayName')"
          >
            <span class="truncate">{{ profile.displayName }}</span>
            <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5] shrink-0" />
          </button>
          <div v-else :class="cn(fieldClass, 'h-12 px-4 flex items-center gap-1.5')">
            <input
              v-model="editingValue"
              type="text"
              placeholder="Enter new name"
              autofocus
              class="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
              @keyup.enter="saveField"
              @keyup.escape="cancelEditing"
            />
            <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
              <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
            </button>
            <button type="button" :class="saveIconClass" title="Save" @click="saveField">
              <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
            </button>
          </div>
        </div>

        <!-- Photo URL -->
        <div class="space-y-1.5">
          <label :class="labelClass">Photo URL</label>
          <button
            v-if="editingField !== 'photoUrl'"
            type="button"
            :class="cn(fieldBoxClass, 'h-12 px-4')"
            @click="startEditing('photoUrl')"
          >
            <span
              :class="
                cn(
                  'truncate',
                  !profile.photoUrl && 'text-muted-foreground/60 italic font-medium',
                )
              "
            >
              {{ profile.photoUrl || "Add a photo link" }}
            </span>
            <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5] shrink-0" />
          </button>
          <div v-else :class="cn(fieldClass, 'p-3 space-y-2')">
            <textarea
              v-model="editingValue"
              placeholder="https://example.com/photo.jpg"
              rows="2"
              autofocus
              class="w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground/50 placeholder:font-medium"
              @keyup.escape="cancelEditing"
            />
            <div class="flex justify-end gap-1">
              <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
              </button>
              <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label :class="labelClass">Bio</label>
            <span
              v-if="editingField === 'bio'"
              :class="[
                'text-xs font-bold',
                editingValue.length > bioMaxLength
                  ? 'text-destructive'
                  : 'text-muted-foreground/70',
              ]"
            >
              {{ editingValue.length }}/{{ bioMaxLength }}
            </span>
          </div>
          <button
            v-if="editingField !== 'bio'"
            type="button"
            :class="cn(fieldBoxClass, 'h-12 px-4')"
            @click="startEditing('bio')"
          >
            <span
              :class="
                cn(
                  'truncate',
                  !profile.bio && 'text-muted-foreground/60 italic font-medium',
                )
              "
            >
              {{ profile.bio || "Add a short bio" }}
            </span>
            <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5] shrink-0" />
          </button>
          <div v-else :class="cn(fieldClass, 'p-3 space-y-2')">
            <textarea
              v-model="editingValue"
              placeholder="Tell others about yourself..."
              rows="3"
              :maxlength="bioMaxLength"
              autofocus
              class="w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground/50 placeholder:font-medium"
              @keyup.escape="cancelEditing"
            />
            <div class="flex justify-end gap-1">
              <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
              </button>
              <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Goals -->
        <div class="space-y-1.5">
          <label :class="labelClass">Goals</label>
          <button
            v-if="editingField !== 'goals'"
            type="button"
            :class="cn(fieldBoxClass, 'min-h-12 px-4 py-2.5 items-start')"
            @click="startEditing('goals')"
          >
            <div class="flex flex-wrap gap-1.5 flex-1">
              <template v-if="profile.goals.length > 0">
                <Badge v-for="goal in profile.goals" :key="goal" :class="tagViewClass">
                  {{ goalLabel(goal) }}
                </Badge>
              </template>
              <span v-else class="text-muted-foreground/60 italic font-medium text-sm">
                Add your goals
              </span>
            </div>
            <div class="flex items-center py-1.5 shrink-0">
              <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5]" />
            </div>
          </button>
          <div v-else :class="cn(fieldClass, 'p-3 flex items-start justify-between gap-3')">
            <div class="flex flex-wrap gap-2 flex-1">
              <Badge
                v-for="goal in goalOptions"
                :key="goal.id"
                variant="outline"
                class="cursor-pointer px-3 py-1.5 text-sm font-bold rounded-full transition-all duration-200 hover:scale-105"
                :class="pillClass(editingArrayValue.includes(goal.id))"
                @click="toggleArrayValue(goal.id)"
              >
                {{ goal.label }}
              </Badge>
            </div>
            <div class="flex items-center gap-1 py-1.5 shrink-0">
              <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
              </button>
              <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Vibes -->
        <div class="space-y-1.5">
          <label :class="labelClass">Vibes</label>
          <button
            v-if="editingField !== 'vibes'"
            type="button"
            :class="cn(fieldBoxClass, 'min-h-12 px-4 py-2.5 items-start')"
            @click="startEditing('vibes')"
          >
            <div class="flex flex-wrap gap-1.5 flex-1">
              <template v-if="profile.vibes.length > 0">
                <Badge v-for="vibe in profile.vibes" :key="vibe" :class="tagViewClass">
                  {{ vibe }}
                </Badge>
              </template>
              <span v-else class="text-muted-foreground/60 italic font-medium text-sm">
                Add your vibe
              </span>
            </div>
            <div class="flex items-center py-1.5 shrink-0">
              <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5]" />
            </div>
          </button>
          <div v-else :class="cn(fieldClass, 'p-3 flex items-start justify-between gap-3')">
            <div class="flex flex-wrap gap-2 flex-1">
              <Badge
                v-for="vibe in vibeOptions"
                :key="vibe"
                variant="outline"
                class="cursor-pointer px-3 py-1.5 text-sm font-bold rounded-full transition-all duration-200 hover:scale-105"
                :class="pillClass(editingArrayValue.includes(vibe))"
                @click="toggleArrayValue(vibe)"
              >
                {{ vibe }}
              </Badge>
            </div>
            <div class="flex items-center gap-1 py-1.5 shrink-0">
              <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
              </button>
              <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Interests -->
        <div class="space-y-1.5">
          <label :class="labelClass">Interests</label>
          <button
            v-if="editingField !== 'interests'"
            type="button"
            :class="cn(fieldBoxClass, 'min-h-12 px-4 py-2.5 items-start')"
            @click="startEditing('interests')"
          >
            <div class="flex flex-wrap gap-1.5 flex-1">
              <template v-if="profile.interests.length > 0">
                <Badge
                  v-for="interest in profile.interests"
                  :key="interest"
                  :class="tagViewClass"
                >
                  {{ interest }}
                </Badge>
              </template>
              <span v-else class="text-muted-foreground/60 italic font-medium text-sm">
                Add your interests
              </span>
            </div>
            <div class="flex items-center py-1.5 shrink-0">
              <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5]" />
            </div>
          </button>
          <div v-else :class="cn(fieldClass, 'p-3 flex items-start justify-between gap-3')">
            <div class="flex-1 min-w-0 space-y-3">
              <Accordion
                type="multiple"
                class="w-full"
                :default-value="['academic']"
              >
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
                          editingArrayValue.filter((i) =>
                            category.options.includes(i),
                          ).length > 0
                        "
                        class="ml-1 text-xs bg-accent/15 text-primary border-none"
                      >
                        {{
                          editingArrayValue.filter((i) =>
                            category.options.includes(i),
                          ).length
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
                        :class="pillClass(editingArrayValue.includes(option))"
                        @click="toggleArrayValue(option)"
                      >
                        {{ option }}
                      </Badge>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <!-- Custom Tags -->
              <div class="pt-3 border-t border-primary/10">
                <label :class="labelClass">Add your own tags</label>
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
                    :class="cn(tagViewClass, 'flex items-center gap-1.5')"
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

            <div class="flex items-center gap-1 py-1.5 shrink-0">
              <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
              </button>
              <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
              </button>
            </div>
          </div>
        </div>

        <!-- More details: fields that almost never change once set -->
        <Accordion type="single" collapsible class="pt-1">
          <AccordionItem value="more-details" class="border-primary/10">
            <AccordionTrigger
              class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground/80 hover:no-underline py-2"
            >
              More details
            </AccordionTrigger>
            <AccordionContent>
              <div class="space-y-5 pt-3">
                <!-- Gender -->
                <div class="space-y-1.5">
                  <label :class="labelClass">Gender</label>
                  <button
                    v-if="editingField !== 'gender'"
                    type="button"
                    :class="cn(fieldBoxClass, 'h-12 px-4')"
                    @click="startEditing('gender')"
                  >
                    <span class="truncate">{{ genderLabel(profile.gender) }}</span>
                    <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5] shrink-0" />
                  </button>
                  <div v-else :class="cn(fieldClass, 'p-3 space-y-2.5')">
                    <div class="flex gap-2">
                      <button
                        v-for="g in genderOptions"
                        :key="g.value"
                        type="button"
                        class="flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-xl cursor-pointer"
                        :class="pillClass(editingValue === g.value)"
                        @click="editingValue = g.value"
                      >
                        <Icon :name="g.icon" size="20" />
                        <span class="text-xs font-bold">{{ g.label }}</span>
                      </button>
                    </div>
                    <div class="flex justify-end gap-1">
                      <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                        <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
                      </button>
                      <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                        <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Birthday -->
                <div class="space-y-1.5">
                  <label :class="labelClass">Birthday</label>
                  <button
                    v-if="editingField !== 'birthday'"
                    type="button"
                    :class="cn(fieldBoxClass, 'h-12 px-4')"
                    @click="startEditing('birthday')"
                  >
                    <span class="truncate">{{ birthdayLabel(profile.birthday) }}</span>
                    <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5] shrink-0" />
                  </button>
                  <div v-else class="flex items-center gap-1.5">
                    <div class="flex-1 min-w-0">
                      <Popover>
                        <PopoverTrigger as-child>
                          <Button
                            variant="ghost"
                            :class="
                              cn(
                                fieldClass,
                                'h-12 w-full px-4 justify-start gap-2',
                                !editingDate && 'text-muted-foreground font-medium',
                              )
                            "
                          >
                            <Icon name="lucide:calendar" size="16" class="text-accent" />
                            {{
                              editingDate
                                ? df.format(editingDate.toDate(getLocalTimeZone()))
                                : "Select your birthday"
                            }}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0 rounded-2xl">
                          <Calendar
                            v-model="editingDate"
                            :initial-focus="true"
                            :default-placeholder="defaultPlaceholder"
                            layout="month-and-year"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                      <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
                    </button>
                    <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                      <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
                    </button>
                  </div>
                </div>

                <!-- Year -->
                <div class="space-y-1.5">
                  <label :class="labelClass">Year</label>
                  <button
                    v-if="editingField !== 'year'"
                    type="button"
                    :class="cn(fieldBoxClass, 'h-12 px-4')"
                    @click="startEditing('year')"
                  >
                    <span class="truncate">{{ yearLabel(profile.year) }}</span>
                    <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5] shrink-0" />
                  </button>
                  <div v-else class="flex items-center gap-1.5">
                    <div class="flex-1 min-w-0">
                      <Select v-model="editingValue">
                        <SelectTrigger
                          :class="cn(fieldClass, 'h-12 w-full px-4 justify-between')"
                        >
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="year in yearOptions"
                            :key="year.value"
                            :value="year.value"
                          >
                            {{ year.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                      <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
                    </button>
                    <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                      <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
                    </button>
                  </div>
                </div>

                <!-- Major -->
                <div class="space-y-1.5">
                  <label :class="labelClass">Major</label>
                  <button
                    v-if="editingField !== 'major'"
                    type="button"
                    :class="cn(fieldBoxClass, 'h-12 px-4')"
                    @click="startEditing('major')"
                  >
                    <span class="truncate">{{ majorLabel(profile.major) }}</span>
                    <Icon name="lucide:pencil" size="15" class="text-muted-foreground/70 [stroke-width:2.5] shrink-0" />
                  </button>
                  <div v-else class="flex items-center gap-1.5">
                    <div class="flex-1 min-w-0">
                      <Select v-model="editingValue">
                        <SelectTrigger
                          :class="cn(fieldClass, 'h-12 w-full px-4 justify-between')"
                        >
                          <SelectValue placeholder="Select your major" />
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
                    </div>
                    <button type="button" :class="cancelIconClass" title="Cancel" @click="cancelEditing">
                      <Icon name="lucide:x" size="16" class="[stroke-width:2.5]" />
                    </button>
                    <button type="button" :class="saveIconClass" title="Save" @click="saveField">
                      <Icon name="lucide:check" size="16" class="[stroke-width:2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <!-- Preferences -->
        <div class="pt-5 border-t border-primary/10 space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-sm font-bold text-primary">Show profile publicly</label>
            <Switch :checked="profile.isPublic" @update:checked="togglePublic" />
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm font-bold text-primary">Message notifications</label>
            <Switch
              :checked="profile.notificationsEnabled"
              @update:checked="toggleNotifications"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="shrink-0 p-6 border-t border-primary/5">
        <Button
          variant="outline"
          class="w-full h-11 rounded-2xl border-primary/10 gap-2 font-black text-muted-foreground hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" size="16" />
          Log out
        </Button>
      </div>
    </div>
  </div>
</template>
