<script setup lang="ts">
import type { DateValue } from 'reka-ui';
import { cn } from '~/lib/utils';
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

const date = ref<DateValue>()
const defaultPlaceholder = today(getLocalTimeZone())
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <!-- Question 1 -->
    <div v-if="currentQuestion === 1" class="flex flex-col gap-6 justify-center items-center">
      <h1>Your gender is...</h1>
      <div class="flex flex-col gap-2 justify-center">
        <div class="flex justify-center gap-2">
          <Button :class="`hover:px-6 ${selectedGender === 'male' && 'bg-primary/60'}`"
            @click="selectedGender = 'male'">Male</Button>
          <Button :class="`hover:px-6 ${selectedGender === 'female' && 'bg-primary/60'}`"
            @click="selectedGender = 'female'">Female</Button>
          <Button variant="outline" :class="`hover:px-6 ${selectedGender === 'other' && ''}`"
            @click="selectedGender = 'other'">Other</Button>
        </div>
      </div>
      <h1>When were you born?</h1>
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline" :class="cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )">
            <CalendarIcon class="mr-2 h-4 w-4" />
            {{ date ? date.toString() : "Pick a date" }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar v-model="date" :initial-focus="true" :default-placeholder="defaultPlaceholder"
            layout="month-and-year" />
        </PopoverContent>
      </Popover>
    </div>
    <!-- Question 2 -->
    <div v-if="currentQuestion === 2" class="flex flex-col gap-6 justify-start items-start">
      <h1>Let's get you set up</h1>
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
          </SelectContent>
        </Select>
      </div>
    </div>
    <!-- Question 3 -->
    <div v-if="currentQuestion === 3" class="flex flex-col gap-6 justify-center items-center">
      <h1>Your vibe is...</h1>
      <div class="flex justify-center gap-2">
        <Button :class="`hover:px-6 ${selectedVibe === 'antara' && 'bg-primary/60'}`"
          @click="selectedVibe = 'antara'">Antara</Button>
        <Button :class="`hover:px-6 ${selectedVibe === 'quinx' && 'bg-primary/60'}`"
          @click="selectedVibe = 'quinx'">Quinx</Button>
        <Button :class="`hover:px-6 ${selectedVibe === 'owl' && 'bg-primary/60'}`"
          @click="selectedVibe = 'owl'">Owl</Button>
        <Button variant="outline" class="hover:px-6" @click="selectedGender = 'other'">Other</Button>
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