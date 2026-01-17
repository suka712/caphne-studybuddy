<script setup lang="ts">
  defineProps<{
    currentQuestion: Number
    totalQuestions: Number
    onNext: () => void
    onPrevious: () => void
  }>()
</script>

<template>
  <div class="fixed bottom-15 h-0.5 w-screen bg-muted-foreground/30" />
  <div class="flex bottom-0 fixed h-15 w-screen border-t">
    <div class="flex justify-between items-center w-2xl mx-auto">
      <div class="flex flex-1 justify-start">
        <Button variant="ghost" @click="onPrevious" :disabled="currentQuestion === 1">
          <Icon name="material-symbols:arrow-back-ios-rounded" /> Previous
        </Button>
      </div>
      <div class="flex flex-1 justify-center">
        Someshit
      </div>
      <div class="flex flex-1 justify-end">
        <Button variant="ghost" @click="onNext" :disabled="currentQuestion > totalQuestions">
          {{ currentQuestion >= totalQuestions ? 'Finish' : 'Next'}}
          <Icon name="material-symbols:arrow-forward-ios-rounded" />
        </Button>
      </div>
    </div>
  </div>
</template>