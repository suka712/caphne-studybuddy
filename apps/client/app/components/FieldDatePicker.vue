<script setup lang="ts">
import { cn, fieldBoxClass, fieldLabelClass } from "~/lib/utils";
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

const props = defineProps<{
  label: string;
  fieldKey: string;
  value: string | null;
}>();

const { saveProfileField } = useProfileFieldSave();

const defaultPlaceholder = today(getLocalTimeZone());
const df = new DateFormatter("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const currentDate = computed<DateValue | undefined>(() =>
  props.value ? parseDate(props.value) : undefined,
);

// Picking a date is already a complete action - no separate confirm step.
const handleChange = async (newDate: DateValue | undefined) => {
  if (!newDate) return;
  const iso = `${newDate.year}-${String(newDate.month).padStart(2, "0")}-${String(newDate.day).padStart(2, "0")}`;
  if (iso === props.value) return;
  await saveProfileField({ [props.fieldKey]: iso });
};
</script>

<template>
  <div class="space-y-1.5">
    <label :class="fieldLabelClass">{{ label }}</label>
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          :class="
            cn(
              fieldBoxClass,
              'h-12 w-full px-4 justify-start gap-2 focus-visible:ring-2 focus-visible:ring-accent/40',
              !value && 'text-muted-foreground font-medium',
            )
          "
        >
          <Icon name="lucide:calendar" size="16" class="text-accent" />
          {{
            currentDate
              ? df.format(currentDate.toDate(getLocalTimeZone()))
              : "Select your birthday"
          }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0 rounded-2xl">
        <Calendar
          :model-value="currentDate"
          :initial-focus="true"
          :default-placeholder="defaultPlaceholder"
          layout="month-and-year"
          @update:model-value="handleChange"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>
