<script setup lang="ts">
definePageMeta({ layout: "internal" })

type Gender = "male" | "female" | "other";
type Vibe = "antara" | "owl" | "quinx";
type Preference = "Lesseo" | "Ahyeon" | "Karina" | "Suzy"

const currentQuestion = ref(1);
const selectedGender = ref<Gender>();
const selectedVibe = ref<Vibe>();
const selectedPreference = ref<Preference>();

const totalQuestions = 4;

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
    </div>
    <!-- Question 2 -->
    <div v-if="currentQuestion === 2" class="flex flex-col gap-6 justify-center items-center">
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
    <!-- Question 3 -->
    <div v-if="currentQuestion === 3" class="flex flex-col gap-6 justify-center items-center">
      <h1>You fuck with...</h1>
      <div class="flex justify-center gap-2">
        <Button class="hover:px-6" @click="selectedPreference = 'Lesseo'">Lesseo</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Karina'">Karina</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Ahyeon'">Ahyeon</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Suzy'">Suzy</Button>
        <Button variant="outline" class="hover:px-6" @click="selectedGender = 'other'">Other</Button>
      </div>
    </div>
    <!-- Question 4 -->
    <div v-if="currentQuestion === 4" class="flex flex-col gap-6 justify-center items-center">
      <h1>Anything else you would like your buddies to know?</h1>
      <div class="flex justify-center gap-2">
        <Input type="text" placeholder="I like to video call and work..." class="w-md" />
      </div>
    </div>
    <!-- Question 4 -->
    <div v>
    </div>
    <div v-if="currentQuestion === 5" class="flex flex-col gap-6 justify-center items-center">
      <h1>Gathering the latest matches</h1>
      <Icon name="svg-spinners:ring-resize" size="25" />
    </div>
  </div>
  
  <ProgressControl :currentQuestion="currentQuestion" :totalQuestions="totalQuestions" :onNext="onNext"
    :onPrevious="onPrevious" />
</template>