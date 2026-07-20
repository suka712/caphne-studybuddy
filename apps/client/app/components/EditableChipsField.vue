<script setup lang="ts">
import { toast } from "vue-sonner";
import { chipClass, chipViewClass } from "~/lib/utils";

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
</script>

<template>
  <EditableField
    :label="label"
    :editing="editing"
    multiline
    chips
    @start-edit="startEdit"
    @save="save"
    @cancel="cancel"
  >
    <template #view>
      <template v-if="value.length > 0">
        <Badge v-for="v in value" :key="v" :class="chipViewClass">
          {{ labelFor(v) }}
        </Badge>
      </template>
      <span v-else class="text-muted-foreground/60 italic font-medium text-sm">
        {{ emptyText }}
      </span>
    </template>

    <template #edit>
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="option in options"
          :key="option.value"
          variant="outline"
          class="cursor-pointer px-3 py-1.5 text-sm font-bold rounded-full transition-all duration-200 hover:scale-105"
          :class="chipClass(draft.includes(option.value))"
          @click="toggle(option.value)"
        >
          {{ option.label }}
        </Badge>
      </div>
    </template>
  </EditableField>
</template>
