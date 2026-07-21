<script setup lang="ts">
import { toast } from "vue-sonner";

const props = withDefaults(
  defineProps<{
    label: string;
    fieldKey: string;
    value: string | null;
    placeholder?: string;
    emptyText?: string;
    // Save null instead of "" when cleared (e.g. photoUrl).
    allowEmpty?: boolean;
    validate?: (value: string) => Promise<string | null> | string | null;
  }>(),
  { placeholder: "", emptyText: "Not set", allowEmpty: false },
);

const { saveProfileField } = useProfileFieldSave();

const editing = ref(false);
const draft = ref("");

const startEdit = () => {
  draft.value = props.value ?? "";
  editing.value = true;
};

const cancel = () => {
  editing.value = false;
  draft.value = "";
};

const save = async () => {
  const trimmed = draft.value.trim();

  if (props.validate) {
    const error = await props.validate(trimmed);
    if (error) {
      toast.error(error);
      return;
    }
  }

  const ok = await saveProfileField({
    [props.fieldKey]: trimmed || (props.allowEmpty ? null : ""),
  });
  if (ok) editing.value = false;
};
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between gap-2">
      <label
        class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
      >
        {{ label }}
      </label>
      <div class="flex items-center gap-1">
        <template v-if="editing">
          <button
            type="button"
            title="Cancel"
            class="size-7 rounded-lg flex items-center justify-center text-muted-foreground transition-colors hover:bg-secondary/60"
            @click="cancel"
          >
            <Icon name="lucide:x" size="17" class="[stroke-width:2.75]" />
          </button>
          <button
            type="button"
            title="Save"
            class="size-7 rounded-lg flex items-center justify-center text-accent transition-colors hover:bg-accent/15"
            @click="save"
          >
            <Icon name="lucide:check" size="17" class="[stroke-width:2.75]" />
          </button>
        </template>
        <button
          v-else
          type="button"
          title="Edit"
          class="size-7 rounded-lg flex items-center justify-center text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-primary"
          @click="startEdit"
        >
          <Icon name="lucide:pencil" size="16" class="[stroke-width:2.75]" />
        </button>
      </div>
    </div>

    <!-- One fixed 48px box, shown or edited — can't change size. -->
    <div
      class="h-12 flex items-center rounded-xl border border-primary/10 bg-secondary/50 px-3 text-sm font-bold"
    >
      <span
        v-if="!editing"
        class="truncate"
        :class="!value && 'text-muted-foreground/60 italic font-medium'"
      >
        {{ value || emptyText }}
      </span>
      <input
        v-else
        v-model="draft"
        type="text"
        :placeholder="placeholder"
        autofocus
        class="w-full min-w-0 bg-transparent p-0 outline-none placeholder:font-medium placeholder:text-muted-foreground/50"
        @keyup.enter="save"
        @keyup.escape="cancel"
      />
    </div>
  </div>
</template>
