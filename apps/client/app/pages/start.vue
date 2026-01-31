<script setup lang="ts">
import type { DateValue } from 'reka-ui'
import { cn } from '~/lib/utils'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { CalendarIcon, Plus, X } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { goalOptions, interestCategories, majorOptions, vibeOptions, yearOptions } from '~/data/startOptions'

definePageMeta({ layout: "internal" })

type Gender = "male" | "female" | "other"

const currentQuestion = ref(1)
const totalQuestions = 7

const selectedGender = ref<Gender>()
const date = ref<DateValue>()
const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const displayName = ref('')
const selectedYear = ref('')
const selectedMajor = ref('')

const selectedGoals = ref<string[]>([])
const selectedVibes = ref<string[]>([])

const toggleGoal = (goalId: string) => {
  if (selectedGoals.value.includes(goalId)) {
    selectedGoals.value = selectedGoals.value.filter(g => g !== goalId)
  } else {
    selectedGoals.value = [...selectedGoals.value, goalId]
  }
}

const toggleVibe = (vibe: string) => {
  if (selectedVibes.value.includes(vibe)) {
    selectedVibes.value = selectedVibes.value.filter(v => v !== vibe)
  } else {
    selectedVibes.value = [...selectedVibes.value, vibe]
  }
}

const selectedInterests = ref<string[]>([])
const customTag = ref('')
const customTags = ref<string[]>([])

const toggleInterest = (interest: string) => {
  if (selectedInterests.value.includes(interest)) {
    selectedInterests.value = selectedInterests.value.filter(i => i !== interest)
  } else {
    selectedInterests.value = [...selectedInterests.value, interest]
  }
}

const addCustomTag = () => {
  if (customTag.value.trim() && !customTags.value.includes(customTag.value.trim())) {
    customTags.value = [...customTags.value, customTag.value.trim()]
    selectedInterests.value = [...selectedInterests.value, customTag.value.trim()]
    customTag.value = ''
  }
}

const removeCustomTag = (tag: string) => {
  customTags.value = customTags.value.filter(t => t !== tag)
  selectedInterests.value = selectedInterests.value.filter(i => i !== tag)
}

const bio = ref('')
const bioMaxLength = 200
const bioLength = computed(() => bio.value.length)

const showPublicProfile = ref(false)

const onNext = () => {
  if (currentQuestion.value < totalQuestions) {
    currentQuestion.value++
  }
}

const onPrevious = () => {
  if (currentQuestion.value > 1) {
    currentQuestion.value--
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen pb-20">
    <!---------------------------------------Screen 1--------------------------------------->
    <div v-if="currentQuestion === 1" class="flex flex-col items-center max-w-md px-4">
      <div class="text-center mb-8">
        <h1
          class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all text-sm mb-2">
          <Icon name="streamline-pixel:food-drink-desert-cake" size="20" class="mr-2" />
          Let's get started
        </h1>
        <h2 class="text-2xl font-semibold">Tell us about yourself</h2>
      </div>

      <!-- Gender Selection -->
      <div class="w-full mb-8">
        <Label class="text-sm text-muted-foreground mb-3 block">Your gender</Label>
        <div class="flex gap-3">
          <Button variant="outline"
            :class="cn('flex-1 h-16 flex-col gap-1 size-18', selectedGender === 'male' && 'border-primary bg-primary/10')"
            @click="selectedGender = 'male'">
            <Icon name="streamline-pixel:user-gender-male" size="28" />
            <span class="text-xs">Male</span>
          </Button>
          <Button variant="outline"
            :class="cn('flex-1 h-16 flex-col gap-1 size-18', selectedGender === 'female' && 'border-primary bg-primary/10')"
            @click="selectedGender = 'female'">
            <Icon name="streamline-pixel:user-gender-female" size="28" />
            <span class="text-xs">Female</span>
          </Button>
          <Button variant="outline"
            :class="cn('flex-1 h-16 flex-col gap-1 size-18', selectedGender === 'other' && 'border-primary bg-primary/10')"
            @click="selectedGender = 'other'">
            <Icon name="streamline-pixel:interface-essential-question-help-square" size="28" />
            <span class="text-xs">Other</span>
          </Button>
        </div>
      </div>

      <!-- Birthday -->
      <div class="w-full">
        <Label class="text-sm text-muted-foreground mb-3 block">Birthday</Label>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline"
              :class="cn('w-full justify-start text-left font-normal h-9', !date && 'text-muted-foreground')">
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ date ? df.format(date.toDate(getLocalTimeZone())) : "Select your birthday" }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="date" :initial-focus="true" :default-placeholder="defaultPlaceholder"
              layout="month-and-year" />
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!---------------------------------------Screen 2--------------------------------------->
    <div v-if="currentQuestion === 2" class="flex flex-col items-center max-w-md px-4">
      <div class="text-center mb-8">
        <h1
          class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all text-sm mb-2">
          <Icon name="streamline-pixel:interface-essential-information-circle-1" size="20" class="mr-2" />
          School info
        </h1>
        <h2 class="text-2xl font-semibold">Let's get you set up</h2>
      </div>

      <!-- Display Name -->
      <div class="w-full mb-6">
        <Label class="text-sm text-muted-foreground mb-3 block">What should others call you?</Label>
        <Input v-model="displayName" placeholder="Enter your name" class="h-9" />
      </div>

      <!-- Year -->
      <div class="w-full mb-6">
        <Label class="text-sm text-muted-foreground mb-3 block">Year</Label>
        <Select v-model="selectedYear">
          <SelectTrigger class="h-12">
            <SelectValue placeholder="Select your year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="year in yearOptions" :key="year.value" :value="year.value">
              {{ year.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Major -->
      <div class="w-full">
        <Label class="text-sm text-muted-foreground mb-3 block">Major</Label>
        <Select v-model="selectedMajor">
          <SelectTrigger class="h-12">
            <SelectValue placeholder="Select your major" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup v-for="group in majorOptions" :key="group.group">
              <SelectLabel>{{ group.group }}</SelectLabel>
              <SelectItem v-for="item in group.items" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!---------------------------------------Screen 3--------------------------------------->
    <div v-if="currentQuestion === 3" class="flex flex-col items-center max-w-lg px-4">
      <div class="text-center mb-8">
        <h1
          class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all text-sm mb-2">
          <Icon name="streamline-pixel:interface-essential-question-help-square" size="20" class="mr-2" />
          Pick all that apply
        </h1>
        <h2 class="text-2xl font-semibold">What brings you here?</h2>
      </div>

      <!-- Goals -->
      <div class="w-full mb-8">
        <Label class="text-sm text-muted-foreground mb-3 block">Goals</Label>
        <div class="grid grid-cols-2 gap-3">
          <Button v-for="goal in goalOptions" :key="goal.id" variant="outline" :class="cn(
            'h-auto py-4 px-4 items-center gap-2 text-center',
            selectedGoals.includes(goal.id) && 'border-primary bg-primary/10'
          )" @click="toggleGoal(goal.id)">
            <Icon :name="goal.icon" size="24" />
            <span class="text-sm">{{ goal.label }}</span>
          </Button>
        </div>
      </div>

      <!-- Vibe -->
      <div class="w-full">
        <Label class="text-sm text-muted-foreground mb-3 block">Your vibe</Label>
        <div class="flex flex-wrap gap-2">
          <Badge v-for="vibe in vibeOptions" :key="vibe" :variant="selectedVibes.includes(vibe) ? 'default' : 'outline'"
            :class="cn(
              'cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105',
              selectedVibes.includes(vibe) && 'bg-primary'
            )" @click="toggleVibe(vibe)">
            {{ vibe }}
          </Badge>
        </div>
      </div>
    </div>

    <!---------------------------------------Screen 4--------------------------------------->
    <div v-if="currentQuestion === 4" class="flex flex-col items-center max-w-lg px-4 w-full">
      <div class="text-center mb-6">
        <h1
          class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all text-sm mb-2">
          <Icon name="streamline-pixel:interface-essential-star-2" size="20" class="mr-2" />
          Tap everything you vibe with
        </h1>
        <h2 class="text-2xl font-semibold">What are you into?</h2>
      </div>

      <div class="w-full max-h-[50vh] overflow-y-auto pr-2">
        <Accordion type="multiple" class="w-full" :default-value="['academic']">
          <AccordionItem v-for="category in interestCategories" :key="category.id" :value="category.id">
            <AccordionTrigger class="hover:no-underline">
              <div class="flex items-center gap-2">
                <Icon :name="category.icon" size="18" />
                <span>{{ category.label }}</span>
                <Badge v-if="selectedInterests.filter(i => category.options.includes(i)).length > 0" variant="secondary"
                  class="ml-2 text-xs">
                  {{selectedInterests.filter(i => category.options.includes(i)).length}}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div class="flex flex-wrap gap-2 pt-2">
                <Badge v-for="option in category.options" :key="option"
                  :variant="selectedInterests.includes(option) ? 'default' : 'outline'" :class="cn(
                    'cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105',
                    selectedInterests.includes(option) && 'bg-primary'
                  )" @click="toggleInterest(option)">
                  {{ option }}
                </Badge>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <!-- Custom Tags -->
        <div class="pt-4 border-t">
          <Label class="text-sm text-muted-foreground mb-3 block">Add your own tags</Label>
          <div class="flex gap-2 mb-3">
            <Input v-model="customTag" placeholder="Type a tag..." class="flex-1" @keyup.enter="addCustomTag" />
            <Button variant="outline" size="icon" @click="addCustomTag">
              <Plus class="h-4 w-4" />
            </Button>
          </div>
          <div v-if="customTags.length > 0" class="flex flex-wrap gap-2">
            <Badge v-for="tag in customTags" :key="tag" variant="default"
              class="bg-primary px-3 py-1.5 text-sm flex items-center gap-1">
              {{ tag }}
              <X class="h-3 w-3 cursor-pointer hover:text-destructive" @click="removeCustomTag(tag)" />
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <!---------------------------------------Screen 5--------------------------------------->
    <div v-if="currentQuestion === 5" class="flex flex-col items-center max-w-md px-4">
      <div class="text-center mb-8">
        <h1
          class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all text-sm mb-2">
          <Icon name="streamline-pixel:user-profile-focus" size="20" class="mr-2" />
          Almost there
        </h1>
        <h2 class="text-2xl font-semibold">Let people know what's up</h2>
      </div>

      <!-- Profile Photo -->
      <div class="w-full mb-8">
        <Label class="text-sm text-muted-foreground mb-3 block">Profile photo</Label>
        <div class="flex justify-center">
          <Card class="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent class="flex flex-col items-center justify-center p-8">
              <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-3">
                <Icon name="streamline-pixel:user-profile-focus" size="40" class="text-muted-foreground" />
              </div>
              <span class="text-sm text-muted-foreground">Click to upload</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Bio -->
      <div class="w-full">
        <div class="flex justify-between items-center mb-3">
          <Label class="text-sm text-muted-foreground">A short bio</Label>
          <span :class="cn('text-xs', bioLength > bioMaxLength ? 'text-destructive' : 'text-muted-foreground')">
            {{ bioLength }}/{{ bioMaxLength }}
          </span>
        </div>
        <Textarea v-model="bio" placeholder="I'm into late night study sessions. LF study buddies..." :rows="4"
          :maxlength="bioMaxLength" class="resize-none" />
      </div>
    </div>

    <!---------------------------------------Screen 6--------------------------------------->
    <div v-if="currentQuestion === 6" class="flex flex-col items-center max-w-md px-4">
      <div class="text-center mb-8">
        <h1
          class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all text-sm mb-2">
          Account privacy
        </h1>
        <h2 class="text-2xl font-semibold">Control who finds you</h2>
      </div>

      <Card class="w-full py-2">
        <CardContent class="">
          <div class="flex items-center justify-center gap-4">
            <div class="flex-1">
              <h3 class="font-medium mb-1">Show profile publicly</h3>
            </div>
            <Switch v-model:checked="showPublicProfile" />
          </div>
        </CardContent>
      </Card>
      <p class="text-xs text-muted-foreground mt-6 text-center">
        When enabled, people can find and view your profile without matching first.
        You can change this anytime in settings.
      </p>
    </div>

    <!---------------------------------------Screen 7--------------------------------------->
    <div v-if="currentQuestion === 7" class="flex flex-col items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="40" class="text-primary mb-6" />
      <h2 class="text-2xl font-semibold mb-2">Setting things up...</h2>
      <p class="text-muted-foreground text-center">Finding the best matches for you</p>
    </div>
  </div>

  <ProgressControl :currentQuestion="currentQuestion" :totalQuestions="totalQuestions" :onNext="onNext"
    :onPrevious="onPrevious" />
</template>
