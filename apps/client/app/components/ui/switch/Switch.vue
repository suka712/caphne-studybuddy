<script setup lang="ts">
import type { SwitchRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { SwitchRoot, SwitchThumb, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

// reka-ui's SwitchRoot is controlled via `modelValue`/`update:modelValue`.
// The rest of the app uses the shadcn-style `checked`/`update:checked` API,
// so this wrapper adapts between the two.
const props = defineProps<
  SwitchRootProps & {
    checked?: boolean;
    class?: HTMLAttributes["class"];
  }
>();

const emits = defineEmits<{
  (e: "update:checked", value: boolean): void;
}>();

const delegatedProps = reactiveOmit(
  props,
  "class",
  "checked",
  "modelValue",
  "defaultValue",
);
const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <SwitchRoot
    data-slot="switch"
    v-bind="forwarded"
    :model-value="checked ?? false"
    :class="
      cn(
        'peer data-[state=checked]:bg-accent data-[state=unchecked]:bg-secondary border-primary/10 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-7 w-12 shrink-0 items-center rounded-full border shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @update:model-value="(value) => emits('update:checked', Boolean(value))"
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="
        cn(
          'bg-background pointer-events-none block size-6 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0',
        )
      "
    />
  </SwitchRoot>
</template>
