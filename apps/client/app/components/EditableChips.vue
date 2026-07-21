<script setup lang="ts">
import { toast } from "vue-sonner";

const props = defineProps<{
  label: string;
  fieldKey: string;
  value: readonly string[];
  options: { value: string; label: string }[];
  emptyText?: string;
}>();

const { saveProfileField } = useProfileFieldSave();

const editing = ref(false);
const draft = ref<string[]>([]);

const startEdit = () => {
  draft.value = [...props.value];
  editing.value = true;
};

const cancel = () => {
  editing.value = false;
  draft.value = [];
};

const toggle = (value: string) => {
  draft.value = draft.value.includes(value)
    ? draft.value.filter((v) => v !== value)
    : [...draft.value, value];
};

const save = async () => {
  if (draft.value.length === 0) {
    toast.error("Select at least one option");
    return;
  }
  const ok = await saveProfileField({ [props.fieldKey]: [...draft.value] });
  if (ok) editing.value = false;
};

const labelFor = (value: string) =>
  props.options.find((o) => o.value === value)?.label ?? value;

// Selected vs unselected chip colours (local — nothing else needs them).
const selectedChip = "bg-accent/15 border-accent/30 text-primary";
const unselectedChip =
  "bg-secondary/50 border-primary/10 text-muted-foreground hover:bg-secondary/70";
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

    <!-- Shown -->
    <div
      v-if="!editing"
      class="min-h-12 flex flex-wrap gap-2 rounded-xl border border-primary/10 bg-secondary/50 px-3 py-2.5"
    >
      <Badge
        v-for="v in value"
        :key="v"
        class="px-3 py-1.5 text-sm font-bold rounded-full bg-accent/15 border-accent/30 text-primary"
      >
        {{ labelFor(v) }}
      </Badge>
      <span
        v-if="value.length === 0"
        class="text-sm font-medium italic text-muted-foreground/60"
      >
        {{ emptyText ?? "Not set" }}
      </span>
    </div>

    <!-- Editing -->
    <div
      v-else
      class="min-h-12 flex flex-wrap gap-2 rounded-xl border border-primary/10 bg-secondary/50 px-3 py-2.5"
    >
      <Badge
        v-for="option in options"
        :key="option.value"
        variant="outline"
        class="cursor-pointer px-3 py-1.5 text-sm font-bold rounded-full transition-all duration-200 hover:scale-105"
        :class="draft.includes(option.value) ? selectedChip : unselectedChip"
        @click="toggle(option.value)"
      >
        {{ option.label }}
      </Badge>
    </div>
  </div>
</template>
