<template>
  <div class="min-h-screen bg-background text-foreground grain">
    <div class="fixed inset-0 -z-10 dot-grid pointer-events-none" />
    <NavBar />
    <main class="mx-auto max-w-7xl px-4 py-8 relative">
      <slot />
    </main>
  </div>
</template>
