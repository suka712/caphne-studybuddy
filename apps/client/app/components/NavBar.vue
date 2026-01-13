<template>
  <header class="sticky top-0">
    <nav class="flex items-center mx-auto max-w-7xl px-4 py-4">
      <div class="flex flex-1 justify-start">
        <NuxtLink to="/" class="text-xl font-bold">
          Caphne
        </NuxtLink>
      </div>
      <div class="flex flex-1 gap-2 justify-center">
        <Button>One button</Button>
        <Button>Two button</Button>
        <Button>Three button</Button>
      </div>
      <div class="flex flex-1 gap-2 justify-end">
        <Button>
          Language
        </Button>
        <Button>
          Start now
        </Button>
      </div>
    </nav>
  </header>
</template>