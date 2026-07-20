<script setup lang="ts">
import { toast } from "vue-sonner";

const props = withDefaults(
  defineProps<{
    label: string;
    fieldKey: string;
    value: string | null;
    placeholder?: string;
    emptyText?: string;
    multiline?: boolean;
    maxLength?: number;
    // Save null instead of "" when cleared (photoUrl); default saves "".
    allowEmpty?: boolean;
    validate?: (value: string) => Promise<string | null> | string | null;
  }>(),
  {
    placeholder: "",
    emptyText: "Not set",
    multiline: false,
    allowEmpty: false,
  },
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
  <EditableField
    :label="label"
    :editing="editing"
    :multiline="multiline"
    @start-edit="startEdit"
    @save="save"
    @cancel="cancel"
  >
    <template v-if="multiline && maxLength" #label-suffix>
      <span
        :class="[
          'text-xs font-bold',
          draft.length > maxLength
            ? 'text-destructive'
            : 'text-muted-foreground/70',
        ]"
      >
        {{ draft.length }}/{{ maxLength }}
      </span>
    </template>

    <template #view>
      <span :class="!value && 'text-muted-foreground/60 italic font-medium'">
        {{ value || emptyText }}
      </span>
    </template>

    <template #edit>
      <textarea
        v-if="multiline"
        v-model="draft"
        :placeholder="placeholder"
        :rows="maxLength ? 3 : 2"
        :maxlength="maxLength"
        autofocus
        class="w-full bg-transparent p-0 outline-none resize-none field-sizing-content placeholder:text-muted-foreground/50 placeholder:font-medium"
        @keyup.escape="cancel"
      />
      <input
        v-else
        v-model="draft"
        type="text"
        :placeholder="placeholder"
        autofocus
        class="w-full min-w-0 bg-transparent p-0 outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
        @keyup.enter="save"
        @keyup.escape="cancel"
      />
    </template>
  </EditableField>
</template>
