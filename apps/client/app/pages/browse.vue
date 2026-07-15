<script setup lang="ts">
definePageMeta({ layout: "internal", middleware: "auth" });
</script>
<template>
  <div>
    <div
      class="p-5 pb-4 pl-6 border-b border-primary/5 flex items-center justify-between"
    >
      <h1 class="text-xl font-black text-primary flex items-center gap-2">
        Browse
      </h1>
      <!-- TODOO: Implement filter here -->
      <Button
        variant="outline"
        class="rounded-xl h-9 px-4 font-bold border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all"
      >
        Filter
      </Button>
    </div>
    <ScrollArea class="flex-1 min-h-0">
      <div class="p-5">
        <div
          class="flex items-center gap-4 p-2 rounded-md bg-secondary/30 hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-primary/5"
        >
          <img
            src="https://i.pinimg.com/736x/67/0d/a7/670da7c3f9cc857613346cecd5ecba26.jpg"
            alt="Profile"
            class="rounded-sm"
          >
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
