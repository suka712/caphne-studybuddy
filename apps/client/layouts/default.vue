<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b">
      <nav class="mx-auto max-w-7xl px-4 py-4">
        <NuxtLink to="/" class="text-xl font-bold">
          Caphne
        </NuxtLink>
      </nav>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
