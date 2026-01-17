<script setup lang="ts">
import { useScrollNavbar } from '~/lib/utils';

const { showNavbar } = useScrollNavbar()
const mobileMenuOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
    <nav class="flex items-center mx-auto max-w-7xl px-4 py-4 transition-opacity duration-500"
      :class="showNavbar ? 'opacity-100' : 'opacity-0 pointer-events-none'">
      <div class="flex flex-1 justify-start">
        <NuxtLink to="/" class="text-xl font-bold">
          Caphne
        </NuxtLink>
      </div>
      <!-- Desktop navigation -->
      <div class="hidden lg:flex flex-3 gap-2 justify-center">
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
                  <div class="flex gap-2">
                    <a href="https://github.com/suka712/caphne-studybuddy" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" class="size-24">
                        <Icon name="ci:github" size="30"/>
                      </Button>
                    </a>
                    <div>
                      <a href="https://github.com/suka712" target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" class="h-8 w-full justify-start">Khiem Nguyen</Button>
                      </a>
                      <a href="https://github.com/Giaugg" target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" class="h-8 w-full justify-start">Rich Le</Button>
                      </a>
                      <a href="https://github.com/trnahnh" target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" class="h-8 w-full justify-start">Andrea Tran</Button>
                      </a>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <!-- Desktop right section -->
      <div class="hidden lg:flex flex-1 gap-2 justify-end">
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
        <NuxtLink to="/start">
          <Button>
            Start now
          </Button>
        </NuxtLink>
      </div>
      <!-- Mobile hamburger button -->
      <div class="flex lg:hidden">
        <Button variant="ghost" size="icon" @click="mobileMenuOpen = !mobileMenuOpen">
          <Icon v-if="mobileMenuOpen" name="lucide:x" size="24" />
          <Icon v-else name="lucide:menu" size="24" />
        </Button>
      </div>
    </nav>
    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="lg:hidden border-t">
      <div class="flex flex-col gap-2 px-4 py-4">
        <Button variant="ghost" class="justify-start">Stories</Button>
        <Button variant="ghost" class="justify-start">Events</Button>
        <Button variant="ghost" class="justify-start">Friends</Button>
        <Button variant="ghost" class="justify-start">Support</Button>
        <Button variant="ghost" class="justify-start">Donate</Button>
        <div class="border-t my-2"></div>
        <p class="text-sm text-muted-foreground px-4">Contribute</p>
        <a href="https://github.com/suka712/caphne-studybuddy" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" class="justify-start w-full">
            <Icon name="ci:github" size="20" class="mr-2" />
            GitHub Repo
          </Button>
        </a>
        <div class="border-t my-2"></div>
        <p class="text-sm text-muted-foreground px-4">Language</p>
        <Button variant="ghost" class="justify-start">English</Button>
        <Button variant="ghost" class="justify-start">Vietnamese</Button>
        <div class="border-t my-2"></div>
        <Button class="w-full">Start now</Button>
      </div>
    </div>
  </header>
</template>