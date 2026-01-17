<script setup lang="ts">
definePageMeta({ layout: "internal" })

type Gender = "male" | "female" | "other";
type Vibe = "antara" | "owl" | "quinx";
type Preference = "Lesseo" | "Rei" | "Gaeul" | "Yujin"

const currentQuestion = ref(1);
const selectedGender = ref<Gender>();
const selectedVibe = ref<Vibe>();
const selectedPreference = ref<Preference>();

const totalQuestions = 3;

const onNext = () => {
  if (currentQuestion.value < totalQuestions) {
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
          <Button :class="`hover:px-6 ${selectedGender === 'male' && 'bg-primary/60'}`" @click="selectedGender = 'male'">Male</Button>
          <Button :class="`hover:px-6 ${selectedGender === 'female' && 'bg-primary/60'}`" @click="selectedGender = 'female'">Female</Button>
          <Button variant="outline" :class="`hover:px-6 ${selectedGender === 'other' && ''}`" @click="selectedGender = 'other'">Other</Button>
        </div>
      </div>
    </div>
    <!-- Question 2 -->
    <div v-if="currentQuestion === 2" class="flex flex-col gap-6 justify-center items-center">
      <h1>Your vibe is...</h1>
      <div class="flex justify-center gap-2">
        <Button :class="`hover:px-6 ${selectedVibe === 'antara' && 'bg-primary/60'}`" @click="selectedVibe = 'antara'">Antara</Button>
        <Button :class="`hover:px-6 ${selectedVibe === 'quinx' && 'bg-primary/60'}`" @click="selectedVibe = 'quinx'">Quinx</Button>
        <Button :class="`hover:px-6 ${selectedVibe === 'owl' && 'bg-primary/60'}`" @click="selectedVibe = 'owl'">Owl</Button>
        <Button variant="outline" class="hover:px-6" @click="selectedGender = 'other'">Other</Button>
      </div>
    </div>
    <!-- Question 3 -->
    <div v-if="currentQuestion === 3" class="flex flex-col gap-6 justify-center items-center">
      <h1>You fuck with...</h1>
      <div class="flex justify-center gap-2">
        <Button class="hover:px-6" @click="selectedPreference = 'Lesseo'">Lesseo</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Rei'">Rei</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Yujin'">Yujin</Button>
        <Button class="hover:px-6" @click="selectedPreference = 'Gaeul'">Gaeul</Button>
        <Button variant="outline" class="hover:px-6" @click="selectedGender = 'other'">Other</Button>
      </div>
    </div>
  </div>
  <ProgressControl
    :currentQuestion="currentQuestion"
    :totalQuestions="totalQuestions"
    :onNext="onNext"
    :onPrevious="onPrevious" />
</template>