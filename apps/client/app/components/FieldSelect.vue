<script setup lang="ts">
import { cn, fieldBoxClass, fieldLabelClass } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps<{
  label: string;
  fieldKey: string;
  value: string;
  placeholder: string;
  // group: null renders a flat list; a named group wraps its items under
  // a SelectLabel (e.g. Major's category groups).
  groups: { group: string | null; items: { value: string; label: string }[] }[];
}>();

const { saveProfileField } = useProfileFieldSave();
const saving = ref(false);

// No separate edit mode here - picking a value from a dropdown is already
// a complete, unambiguous action, so selecting it just is the save.
const handleChange = async (newValue: unknown) => {
  const next = String(newValue);
  if (!next || next === props.value) return;
  saving.value = true;
  await saveProfileField({ [props.fieldKey]: next });
  saving.value = false;
};
</script>

<template>
  <div class="space-y-1.5">
    <label :class="fieldLabelClass">{{ label }}</label>
    <Select :model-value="value" :disabled="saving" @update:model-value="handleChange">
      <SelectTrigger
        :class="
          cn(
            fieldBoxClass,
            'h-12 w-full px-4 justify-between focus-visible:ring-2 focus-visible:ring-accent/40',
          )
        "
      >
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <template v-for="group in groups" :key="group.group ?? '_flat'">
          <SelectGroup v-if="group.group">
            <SelectLabel>{{ group.group }}</SelectLabel>
            <SelectItem v-for="item in group.items" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectItem>
          </SelectGroup>
          <template v-else>
            <SelectItem v-for="item in group.items" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectItem>
          </template>
        </template>
      </SelectContent>
    </Select>
  </div>
</template>
