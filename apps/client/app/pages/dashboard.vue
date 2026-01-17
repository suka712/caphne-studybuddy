<template>
    <div class="flex justify-center items-center min-h-screen p-4">
      <Card class="w-full max-w-md">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Icon name="mdi:account" size="32" />
            </div>
            <div>
              <h1 class="text-xl font-bold">{{ user?.username }}</h1>
              <p class="text-muted-foreground text-sm">{{ user?.email }}</p>
            </div>
          </div>
  
          <div class="space-y-4">
            <div class="p-4 rounded-lg bg-muted">
              <div class="text-sm space-y-1">
                <p><span class="text-muted-foreground">Username:</span> {{ user?.username }}</p>
                <p><span class="text-muted-foreground">Email:</span> {{ user?.email }}</p>
              </div>
            </div>
  
            <NuxtLink to="/start">
                <Button variant="outline" class="w-full mt-2">
                <Icon name="ri:sparkling-2-fill" size="20" class="mr-2" />
                Get started
                </Button>
            </NuxtLink>
            <Button variant="outline" class="w-full mt-2" @click="handleLogout">
              <Icon name="mdi:logout" size="20" class="mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </template>
  
  <script setup lang="ts">
  definePageMeta({
    middleware: 'auth'
  })
  
  const { user, logout } = useAuth()
  
  async function handleLogout() {
    await logout()
    navigateTo('/')
  }
  </script>