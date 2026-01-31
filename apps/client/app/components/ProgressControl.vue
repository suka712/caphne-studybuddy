<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentScreen: number
  totalScreens: number
  onNext: () => void
  onPrevious: () => void
}>()

const progress = computed(() => {
  return Math.round((props.currentScreen / props.totalScreens) * 100)
})

const isLastScreen = computed(() => props.currentScreen >= props.totalScreens)
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background border-t">
    <!-- Progress bar -->
    <div class="h-1 bg-muted">
      <div class="h-full bg-primary transition-all duration-300 ease-out" :style="{ width: `${progress}%` }" />
    </div>

    <!-- Controls -->
    <div class="h-16 flex items-center justify-between max-w-2xl mx-auto px-4">
      <div class="flex-1">
        <Button variant="ghost" @click="onPrevious" :disabled="currentScreen === 1" class="gap-2">
          <Icon name="material-symbols:arrow-back-ios-rounded" size="16" />
          Back
        </Button>
      </div>

      <div class="flex-1 flex justify-center">
        <span class="text-sm text-muted-foreground">
          {{ currentScreen }} of {{ totalScreens}}
        </span>
      </div>

      <div class="flex-1 flex justify-end">
        <Button :disabled="isLastScreen" :variant="isLastScreen ? 'default' : 'ghost'" @click="onNext" class="gap-2">
          {{ isLastScreen ? 'Finish' : 'Next' }}
          <Icon name="material-symbols:arrow-forward-ios-rounded" size="16" />
        </Button>
      </div>
    </div>
  </div>
</template>
