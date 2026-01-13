<script setup lang="ts">
import { useScrollNavbar } from '~/lib/utils';

const { showNavbar } = useScrollNavbar()
</script>

<template>
  <header class="sticky top-0">
    <nav class="flex items-center mx-auto max-w-7xl px-4 py-4 transition-opacity duration-1000"
      :class="showNavbar ? 'opacity-100' : 'opacity-0 pointer-events-none'">
      <div class="flex flex-1 justify-start">
        <NuxtLink to="/" class="text-xl font-bold">
          Caphne
        </NuxtLink>
      </div>
      <div class="flex flex-3 gap-2 justify-center">
        <div>
          <Button class="rounded-l-3xl rounded-r-none">Stories</Button>
          <Button class="rounded-none">Events</Button>
          <Button class="rounded-none">Friends</Button>
          <Button class="rounded-l-none">Support</Button>
        </div>
        <div class="flex">
          <Button class="rounded-r-none">Donate</Button>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger class="rounded-l-none rounded-r-3xl">
                  Contribute
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink>English</NavigationMenuLink>
                  <NavigationMenuLink>Vietnamese</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <div class="flex flex-1 gap-2 justify-end">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger class="bg-primary/10 text-primary hover:bg-primary/20">
                <Icon name="lucide:globe" size="23" />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>English</NavigationMenuLink>
                <NavigationMenuLink>Vietnamese</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button>
          Start now
        </Button>
      </div>
    </nav>
  </header>
</template>