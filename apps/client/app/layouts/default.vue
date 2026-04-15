<template>
  <div
    class="dark min-h-screen bg-background text-foreground dot-grid"
    style="background-color: oklch(0.11 0.005 280)"
  >
    <NavBar />
    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
