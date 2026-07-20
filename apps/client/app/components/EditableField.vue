<script setup lang="ts">
import { cn, fieldBoxClass, fieldLabelClass } from "~/lib/utils";

withDefaults(
  defineProps<{
    label: string;
    editing: boolean;
    multiline?: boolean;
    chips?: boolean;
  }>(),
  { multiline: false, chips: false },
);

defineEmits<{
  (e: "start-edit" | "cancel" | "save"): void;
}>();

const iconButtonClass =
  "shrink-0 size-7 rounded-lg flex items-center justify-center transition-colors";
const editIconClass = cn(
  iconButtonClass,
  "text-muted-foreground hover:bg-secondary/60 hover:text-primary",
);
const saveIconClass = cn(iconButtonClass, "text-accent hover:bg-accent/15");
const cancelIconClass = cn(
  iconButtonClass,
  "text-muted-foreground hover:bg-secondary/60",
);
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-baseline justify-between gap-2">
      <div class="flex items-baseline gap-2">
        <label :class="fieldLabelClass">{{ label }}</label>
        <slot name="label-suffix" />
      </div>
      <div class="flex items-center gap-1">
        <template v-if="editing">
          <button type="button" :class="cancelIconClass" title="Cancel" @click="$emit('cancel')">
            <Icon name="lucide:x" size="17" class="[stroke-width:2.75]" />
          </button>
          <button type="button" :class="saveIconClass" title="Save" @click="$emit('save')">
            <Icon name="lucide:check" size="17" class="[stroke-width:2.75]" />
          </button>
        </template>
        <button
          v-else
          type="button"
          :class="editIconClass"
          title="Edit"
          @click="$emit('start-edit')"
        >
          <Icon name="lucide:pencil" size="16" class="[stroke-width:2.75]" />
        </button>
      </div>
    </div>

    <!-- Value / widget -->
    <div
      v-if="!editing"
      :class="cn(fieldBoxClass, chips ? 'min-h-12 px-3 py-2.5' : multiline ? 'px-3 py-2.5' : 'h-12 px-3 flex items-center')"
    >
      <div :class="chips ? 'flex flex-wrap gap-2' : multiline ? 'whitespace-pre-wrap break-words' : 'truncate'">
        <slot name="view" />
      </div>
    </div>
    <div
      v-else
      :class="cn(fieldBoxClass, multiline ? 'min-h-12 px-3 py-2.5' : 'h-12 px-3 flex items-center')"
    >
      <slot name="edit" />
    </div>
  </div>
</template>
