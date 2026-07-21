<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    value: string | null;
    maxLength?: number;
    placeholder?: string;
  }>(),
  { maxLength: 200, placeholder: "Add a short bio" },
);

const { saveProfileField } = useProfileFieldSave();

const editing = ref(false);
const draft = ref(props.value ?? "");

// While not editing, the textarea mirrors the saved value.
watch(
  () => props.value,
  (v) => {
    if (!editing.value) draft.value = v ?? "";
  },
);

const startEdit = () => {
  editing.value = true;
};

const cancel = () => {
  draft.value = props.value ?? "";
  editing.value = false;
};

const save = async () => {
  const ok = await saveProfileField({ bio: draft.value.trim() });
  if (ok) editing.value = false;
};
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-baseline justify-between gap-2">
      <div class="flex items-baseline gap-2">
        <label
          class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
        >
          {{ label }}
        </label>
        <span
          v-if="editing"
          class="text-xs font-bold"
          :class="
            draft.length > maxLength
              ? 'text-destructive'
              : 'text-muted-foreground/70'
          "
        >
          {{ draft.length }}/{{ maxLength }}
        </span>
      </div>
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

    <!-- Always the same textarea; editing only toggles readonly, so it can't jump. -->
    <textarea
      v-model="draft"
      :readonly="!editing"
      :placeholder="placeholder"
      :maxlength="maxLength"
      rows="1"
      class="w-full resize-none field-sizing-content rounded-xl border border-primary/10 bg-secondary/50 px-3 py-2.5 text-sm font-bold outline-none read-only:cursor-default placeholder:font-medium placeholder:italic placeholder:text-muted-foreground/60"
      @keyup.escape="cancel"
    />
  </div>
</template>
