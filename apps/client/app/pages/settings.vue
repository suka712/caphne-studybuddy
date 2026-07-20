<script setup lang="ts">
import { toast } from "vue-sonner";
import { cn } from "~/lib/utils";

definePageMeta({
  middleware: ["require-auth", "require-profile"],
  layout: "internal",
});

const { authUser, logout } = useAuth();
const { isCheckingProfile, profile, updateProfile } =
  useProfile();

const editingField = ref<"displayName" | "photoUrl" | "bio" | null>(null);
const editingValue = ref("");

const startEditing = (field: "displayName" | "photoUrl" | "bio") => {
  editingField.value = field;
  editingValue.value = profile.value?.[field] || "";
};

const cancelEditing = () => {
  editingField.value = null;
  editingValue.value = "";
};

const bioMaxLength = 200;

const saveField = async () => {
  const field = editingField.value;
  if (!field) return;

  const value = editingValue.value.trim();

  if (field === "displayName" && (!value || value.length < 2)) {
    toast.error("Name must be at least 2 characters");
    return;
  }

  if (field === "photoUrl" && value) {
    const isValid = await validatePhotoUrl(value);
    if (!isValid) {
      toast.error("Could not load image from this URL");
      return;
    }
  }

  if (field === "bio" && value.length > bioMaxLength) {
    toast.error(`Bio must be ${bioMaxLength} characters or less`);
    return;
  }

  try {
    await updateProfile({
      [field]: value || (field === "photoUrl" ? null : ""),
    });
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

const handleLogout = async () => {
  await logout();
  navigateTo("/");
};

const labelClass =
  "text-[11px] font-black uppercase tracking-widest text-muted-foreground/70";
const fieldClass =
  "rounded-2xl border-primary/10 bg-secondary/20 font-bold text-sm focus-visible:ring-2 focus-visible:ring-accent/40";
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
          <div
            v-if="editingField !== 'displayName'"
            class="flex items-center justify-between gap-3"
          >
            <p class="font-bold text-primary truncate">{{ profile.displayName }}</p>
            <Button
              variant="ghost"
              size="icon"
              class="size-8 rounded-xl shrink-0"
              @click="startEditing('displayName')"
              title="Edit name"
            >
              <Icon name="lucide:pencil" size="15" />
            </Button>
          </div>
          <div v-else class="flex gap-2">
            <Input
              v-model="editingValue"
              type="text"
              placeholder="Enter new name"
              :class="cn(fieldClass, 'flex-1 h-10')"
              @keyup.enter="saveField"
              @keyup.escape="cancelEditing"
            />
            <Button
              size="icon"
              class="size-10 rounded-xl shrink-0"
              @click="saveField"
              title="Save"
            >
              <Icon name="lucide:check" size="16" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="size-10 rounded-xl border-primary/10 shrink-0"
              @click="cancelEditing"
              title="Cancel"
            >
              <Icon name="lucide:x" size="16" />
            </Button>
          </div>
        </div>

        <!-- Photo URL -->
        <div class="space-y-1.5">
          <label :class="labelClass">Photo URL</label>
          <div
            v-if="editingField !== 'photoUrl'"
            class="flex items-center justify-between gap-3"
          >
            <p class="font-bold text-primary truncate">
              {{ profile.photoUrl || "Not set" }}
            </p>
            <Button
              variant="ghost"
              size="icon"
              class="size-8 rounded-xl shrink-0"
              @click="startEditing('photoUrl')"
              title="Edit photo URL"
            >
              <Icon name="lucide:pencil" size="15" />
            </Button>
          </div>
          <div v-else class="space-y-2">
            <Textarea
              v-model="editingValue"
              placeholder="https://example.com/photo.jpg"
              :class="cn(fieldClass, 'min-h-16 resize-none')"
              @keyup.escape="cancelEditing"
            />
            <div class="flex gap-2 justify-end">
              <Button
                size="icon"
                class="size-10 rounded-xl"
                @click="saveField"
                title="Save"
              >
                <Icon name="lucide:check" size="16" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="size-10 rounded-xl border-primary/10"
                @click="cancelEditing"
                title="Cancel"
              >
                <Icon name="lucide:x" size="16" />
              </Button>
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
          <div
            v-if="editingField !== 'bio'"
            class="flex items-center justify-between gap-3"
          >
            <p class="font-bold text-primary truncate">
              {{ profile.bio || "Not set" }}
            </p>
            <Button
              variant="ghost"
              size="icon"
              class="size-8 rounded-xl shrink-0"
              @click="startEditing('bio')"
              title="Edit bio"
            >
              <Icon name="lucide:pencil" size="15" />
            </Button>
          </div>
          <div v-else class="space-y-2">
            <Textarea
              v-model="editingValue"
              placeholder="Tell others about yourself..."
              :rows="3"
              :maxlength="bioMaxLength"
              :class="cn(fieldClass, 'resize-none')"
              @keyup.escape="cancelEditing"
            />
            <div class="flex gap-2 justify-end">
              <Button
                size="icon"
                class="size-10 rounded-xl"
                @click="saveField"
                title="Save"
              >
                <Icon name="lucide:check" size="16" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="size-10 rounded-xl border-primary/10"
                @click="cancelEditing"
                title="Cancel"
              >
                <Icon name="lucide:x" size="16" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Public Profile Toggle -->
        <div class="flex items-center justify-between pt-5 border-t border-primary/10">
          <label class="text-sm font-bold text-primary">Show profile publicly</label>
          <Switch :checked="profile.isPublic" @update:checked="togglePublic" />
        </div>
      </div>

      <!-- Footer -->
      <div class="shrink-0 p-6 border-t border-primary/5">
        <div class="flex gap-2">
          <NuxtLink class="flex flex-1" to="/matches">
            <Button
              variant="outline"
              class="w-full h-11 rounded-2xl font-black gap-2 border-primary/10"
            >
              <Icon name="lucide:heart-handshake" size="16" />
              Matches
            </Button>
          </NuxtLink>
          <Button
            variant="outline"
            class="h-11 rounded-2xl border-primary/10 gap-2 font-black text-muted-foreground hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5"
            @click="handleLogout"
          >
            <Icon name="lucide:log-out" size="16" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
