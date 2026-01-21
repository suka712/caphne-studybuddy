<script setup lang="ts">
import type { DateValue } from 'reka-ui'
import { cn } from '~/lib/utils'
import { getLocalTimeZone, today } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

definePageMeta({ layout: "internal" })

type Gender = "male" | "female" | "other";
type Vibe = "antara" | "owl" | "quinx";
type Preference = "Lesseo" | "Ahyeon" | "Karina" | "Suzy"

const currentQuestion = ref(1);
const selectedGender = ref<Gender>();
const selectedVibe = ref<Vibe>();
const selectedPreference = ref<Preference>();

const totalQuestions = 5;

const onNext = () => {
  if (currentQuestion.value <= totalQuestions) {
    currentQuestion.value++;
  }
}

const onPrevious = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--;
  }
}

currentQuestion.value = 3 // DEBUGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG

const date = ref<DateValue>()
const defaultPlaceholder = today(getLocalTimeZone())
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <!-- Question 1 -->
    <div v-if="currentQuestion === 1" class="flex flex-col gap-10 justify-center items-center">
      <h1 class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all">
        <Icon name="streamline-pixel:food-drink-desert-cake" size="23" class="mr-2"/>
        Let's get you setup
      </h1>
      <div class="flex flex-col gap-4 items-center">
        <h1>What's your gender?</h1>
        <div class="flex flex-col gap-2 justify-center">
          <div class="flex justify-center gap-2">
            <Button :class="`size-17 ${selectedGender === 'male' && 'bg-primary/60'}`"
              @click="selectedGender = 'male'">
              <Icon name="streamline-pixel:interface-essential-profile-male" size="40"/>
            </Button>
            <Button :class="`size-17 {selectedGender === 'female' && 'bg-primary/60'}`"
              @click="selectedGender = 'female'">
              <Icon name="streamline-pixel:interface-essential-profile-female" size="40"/>
            </Button>
            <Button variant="outline" :class="`size-17 ${selectedGender === 'other' && ''}`"
              @click="selectedGender = 'other'">
              <Icon name="pixel:face-thinking-solid" size="40"/>
            </Button>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4 items-center">
        <h1>When were you born?</h1>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" :class="cn(
              'w-56 justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )">
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ date ? date.toString() : "dd/mm/yyyy" }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="date" :initial-focus="true" :default-placeholder="defaultPlaceholder"
            layout="month-and-year" />
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <!-- Question 2 -->
    <div v-if="currentQuestion === 2" class="flex flex-col gap-10 justify-start items-start">
      <h1 class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all">
        <Icon name="streamline-pixel:interface-essential-information-circle-1" size="23" class="mr-2"/>
        Some more basic info
      </h1>
      <div class="flex flex-col gap-2 justify-start items-start">
        <h1>What should others call you?</h1>
        <Input placeholder="Pham" />
      </div>
      <div class="flex flex-col gap-2 justify-start items-start">
        <h1>What's your major</h1>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Software engineering?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="software-engineering">
              Software engineering
            </SelectItem>
            <SelectItem value="ai-engineering">
              AI Engineering
            </SelectItem>
            <SelectItem value="cyber-security">
              Cyber security
            </SelectItem>
            <SelectItem value="ic-design">
              Integrated Circuit Design
            </SelectItem>
            <SelectItem value="data-science">
              Data Science
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex flex-col gap-2 justify-start items-start">
        <h1>What year are you in?</h1>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Second year?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first-year">
              First year
            </SelectItem>
            <SelectItem value="second-year">
              Second year
            </SelectItem>
            <SelectItem value="third-year">
              Third year
            </SelectItem>
            <SelectItem value="fourth-year">
              Fourth year
            </SelectItem>
            <SelectItem value="alumni">
              Alumni
            </SelectItem>
            <SelectItem value="alumni">
              Other
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <!-- Question 3 -->
    <div v-if="currentQuestion === 3" class="flex flex-col gap-6 justify-center items-center">
      <h1 class="text-muted-foreground flex justify-center items-center hover:text-foreground transition-all">
        <Icon name="streamline-pixel:interface-essential-question-help-square" size="23" class="mr-2"/>
        What brings you here?
      </h1>
      <div class="flex flex-col gap-2">
        <div class="flex justify-center gap-2">
          <Button :class="`hover:px-6 ${selectedVibe === 'antara' && 'bg-primary/60'}`"
            @click="selectedVibe = 'antara'">Find study buddy</Button>
          <Button :class="`hover:px-6 ${selectedVibe === 'quinx' && 'bg-primary/60'}`"
            @click="selectedVibe = 'quinx'">Find project teammate</Button>
          <Button :class="`hover:px-6 ${selectedVibe === 'owl' && 'bg-primary/60'}`"
            @click="selectedVibe = 'owl'">Learn new stuff</Button>
        </div>
        <div class="flex justify-center gap-2">
          <Button :class="`hover:px-6 ${selectedVibe === 'antara' && 'bg-primary/60'}`"
            @click="selectedVibe = 'antara'">Find sports buddy</Button>
          <Button :class="`hover:px-6 ${selectedVibe === 'quinx' && 'bg-primary/60'}`"
            @click="selectedVibe = 'quinx'">Share skills</Button>
          <Button :class="`hover:px-6 ${selectedVibe === 'owl' && 'bg-primary/60'}`"
            @click="selectedVibe = 'owl'">Hangout</Button>
          <Button variant="outline" class="hover:px-6" @click="selectedGender = 'other'">Meet new people</Button>
        </div>
      </div>
    </div>
    <!-- Question 4 -->
    <div v-if="currentQuestion === 4" class="flex flex-col gap-6 justify-center items-center">
      <h1>You fuck with...</h1>
      <div class="flex justify-center gap-2">
        <Button class="hover:px-6" @click="selectedPreference = 'Lesseo'">Lesseo</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Karina'">Karina</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Ahyeon'">Ahyeon</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Suzy'">Suzy</Button>
        <Button variant="outline" class="hover:px-6" @click="selectedGender = 'other'">Other</Button>
      </div>
    </div>
    <!-- Question 5 -->
    <div v-if="currentQuestion === 5" class="flex flex-col gap-6 justify-center items-center">
      <h1>A short bio to introduce yourself?</h1>
      <div class="flex justify-center gap-2">
        <Input type="text" placeholder="I like to video call and work..." class="w-sm h-15" />
      </div>
    </div>
    <!-- Question 6 -->
    <div v-if="currentQuestion === 6" class="flex flex-col gap-6 justify-center items-center">
      <h1>Gathering the latest matches</h1>
      <Icon name="svg-spinners:ring-resize" size="25" />
    </div>
  </div>

  <ProgressControl :currentQuestion="currentQuestion" :totalQuestions="totalQuestions" :onNext="onNext"
    :onPrevious="onPrevious" />
</template>