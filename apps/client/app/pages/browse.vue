<script setup lang="ts">
definePageMeta({ layout: "internal", middleware: "auth" });
</script>
<template>
  <div>
    <div
      class="p-5 pb-4 pl-6 border-b border-primary/5 flex items-center justify-between"
    >
      <h1 class="text-xl font-black text-primary flex items-center gap-2">
        Matches
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
        >
          Some number
        </span>
      </h1>
      <Button
        variant="outline"
        class="rounded-xl h-9 px-4 font-bold border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
      >
        New
      </Button>
    </div>
  </div>
</template>
