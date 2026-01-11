<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Button
} from '@/components/ui/button'
</script>

<template>
  <div class="flex justify-center items-center">
    <Card class="w-sm mt-60">
      <CardHeader>
        <CardTitle class="text-2xl">Caphne</CardTitle>
        <CardDescription>Find your perfect studymate</CardDescription>
      </CardHeader>
      <CardContent class="text-xl">
        <p>Every journey starts with a friend</p>
        <p>Why not your study?</p>
        <p>Find your studymate today!</p>
        <Button class="mt-5">
          Continue with Google
        </Button>
        <Button class="mt-2">
          Continue with Github
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
