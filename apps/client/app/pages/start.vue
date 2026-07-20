<script setup lang="ts">
import type { DateValue } from "reka-ui";
import { cn } from "~/lib/utils";
import {
  DateFormatter,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import { CalendarIcon, Plus, X } from "lucide-vue-next";
import { ref, computed, watchEffect } from "vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  goalOptions,
  interestCategories,
  majorOptions,
  vibeOptions,
  yearOptions,
} from "~/data/profileOptions";
import { toast } from "vue-sonner";

definePageMeta({ layout: "internal", middleware: "require-auth" });

type Gender = "male" | "female" | "other";

const totalQuestion = 6;
const currentQuestion = ref(1);
const isLoading = ref(false);

const selectedGender = ref<Gender>();
const date = ref<DateValue>();
const defaultPlaceholder = today(getLocalTimeZone());
const df = new DateFormatter("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const displayName = ref("");
const selectedYear = ref("");
const selectedMajor = ref("");
const selectedGoals = ref<string[]>([]);
const selectedVibes = ref<string[]>([]);

const toggleGoal = (goalId: string) => {
  if (selectedGoals.value.includes(goalId)) {
    selectedGoals.value = selectedGoals.value.filter((g) => g !== goalId);
  } else {
    selectedGoals.value = [...selectedGoals.value, goalId];
  }
};

const toggleVibe = (vibe: string) => {
  if (selectedVibes.value.includes(vibe)) {
    selectedVibes.value = selectedVibes.value.filter((v) => v !== vibe);
  } else {
    selectedVibes.value = [...selectedVibes.value, vibe];
  }
};

const selectedInterests = ref<string[]>([]);
const customTag = ref("");
const customTags = ref<string[]>([]);

const toggleInterest = (interest: string) => {
  if (selectedInterests.value.includes(interest)) {
    selectedInterests.value = selectedInterests.value.filter(
      (i) => i !== interest,
    );
  } else {
    selectedInterests.value = [...selectedInterests.value, interest];
  }
};

const addCustomTag = () => {
  if (
    customTag.value.trim() &&
    !customTags.value.includes(customTag.value.trim())
  ) {
    customTags.value = [...customTags.value, customTag.value.trim()];
    selectedInterests.value = [
      ...selectedInterests.value,
      customTag.value.trim(),
    ];
    customTag.value = "";
  }
};

const removeCustomTag = (tag: string) => {
  customTags.value = customTags.value.filter((t) => t !== tag);
  selectedInterests.value = selectedInterests.value.filter((i) => i !== tag);
};

const photoUrl = ref("");
const bio = ref("");
const bioMaxLength = 200;
const bioLength = computed(() => bio.value.length);

const showPublicProfile = ref(false);

const canProceedScreen1 = computed(() => !!selectedGender.value);
const canProceedScreen2 = computed(
  () =>
    displayName.value.trim() !== "" &&
    selectedYear.value !== "" &&
    selectedMajor.value !== "",
);
const canProceedScreen3 = computed(
  () => selectedGoals.value.length > 0 && selectedVibes.value.length > 0,
);
const canProceedScreen4 = computed(() => selectedInterests.value.length > 0);

const { createProfile } = useProfile();

const submitProfile = async () => {
  try {
    const birthday = date.value
      ? `${date.value.year}-${String(date.value.month).padStart(2, "0")}-${String(date.value.day).padStart(2, "0")}`
      : null;

    await createProfile({
      displayName: displayName.value,
      gender: selectedGender.value!,
      birthday,
      year: selectedYear.value,
      major: selectedMajor.value,
      bio: bio.value.trim() || "",
      photoUrl: photoUrl.value.trim() || authUser.value?.oauthPhotoUrl || null,
      isPublic: showPublicProfile.value,
      notificationsEnabled: true,
      goals: selectedGoals.value,
      vibes: selectedVibes.value,
      interests: selectedInterests.value,
    });
    navigateTo("/profile");
  } catch (e) {
    console.error("Failed to create profile:", e);
    isLoading.value = false;
  }
};

const canProceedCurrentScreen = computed(() => {
  switch (currentQuestion.value) {
    case 1:
      return canProceedScreen1.value;
    case 2:
      return canProceedScreen2.value;
    case 3:
      return canProceedScreen3.value;
    case 4:
      return canProceedScreen4.value;
    default:
      return true;
  }
});

const onNext = async () => {
  if (isLoading.value) {
    return;
  }
  if (!canProceedCurrentScreen.value) {
    return;
  }

  if (currentQuestion.value === 5) {
    const isValid = await validatePhotoUrl(photoUrl.value);
    if (!isValid) {
      photoUrl.value = "";
      toast.error("Could not load image from this URL");
    }
  }

  if (currentQuestion.value === totalQuestion) {
    isLoading.value = true;
    await submitProfile();
    return;
  }
  if (currentQuestion.value < totalQuestion) {
    currentQuestion.value++;
  }
};

const onPrevious = () => {
  if (isLoading.value) {
    return;
  }
  if (currentQuestion.value > 1) {
    currentQuestion.value--;
  }
};

const stepNav = useStepNav();

watchEffect(() => {
  stepNav.value = {
    canGoBack: currentQuestion.value > 1,
    canGoNext: canProceedCurrentScreen.value,
    isLoading: isLoading.value,
    isLastStep: currentQuestion.value === totalQuestion,
    onNext,
    onPrevious,
  };
});

onUnmounted(() => {
  stepNav.value = null;
});

const { authUser, fetchUser } = useAuth();

onMounted(async () => {
  await fetchUser();
});

const labelClass = "text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2.5 block";
const fieldClass =
  "h-12 w-full rounded-2xl border-primary/10 bg-secondary/20 px-4 font-bold text-sm focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent/40";

function pillClass(active: boolean) {
  return cn(
    "border transition-all duration-200",
    active
      ? "bg-accent/15 border-accent/40 text-primary shadow-sm"
      : "bg-secondary/20 border-transparent text-muted-foreground hover:bg-secondary/40",
  );
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Step header: segmented progress -->
    <div class="shrink-0 flex gap-1.5 px-6 pt-6 pb-2">
      <span
        v-for="n in totalQuestion"
        :key="n"
        class="h-1.5 flex-1 rounded-full transition-colors duration-500"
        :class="n <= currentQuestion ? 'bg-accent' : 'bg-secondary'"
      />
    </div>

    <!-- Scrollable question body -->
    <div class="flex-1 overflow-y-auto px-6">
      <div class="min-h-full flex flex-col justify-center py-6">
      <Transition name="quiz-step" mode="out-in">
        <!---------------------------------------Screen 1--------------------------------------->
        <div
          v-if="currentQuestion === 1 && !isLoading"
          key="1"
          class="flex flex-col items-center text-center"
        >
          <p
            class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-2"
          >
            <Icon
              name="streamline-pixel:food-drink-desert-cake"
              size="14"
            />
            Let's get started
          </p>
          <h1 class="text-2xl font-black tracking-tight text-primary mb-8">
            Tell us about yourself
          </h1>

          <!-- Gender Selection -->
          <div class="w-full mb-6 text-left">
            <Label :class="labelClass">Your gender</Label>
            <div class="flex gap-3">
              <button
                v-for="g in [
                  { value: 'male', label: 'Male', icon: 'streamline-pixel:user-gender-male' },
                  { value: 'female', label: 'Female', icon: 'streamline-pixel:user-gender-female' },
                  { value: 'other', label: 'Other', icon: 'streamline-pixel:interface-essential-question-help-square' },
                ]"
                :key="g.value"
                type="button"
                class="flex-1 h-18 flex flex-col items-center justify-center gap-1.5 rounded-2xl cursor-pointer"
                :class="pillClass(selectedGender === g.value)"
                @click="selectedGender = g.value as Gender"
              >
                <Icon :name="g.icon" size="24" />
                <span class="text-xs font-bold">{{ g.label }}</span>
              </button>
            </div>
          </div>

          <!-- Birthday -->
          <div class="w-full text-left">
            <Label :class="labelClass">Birthday</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="ghost"
                  :class="
                    cn(
                      fieldClass,
                      'w-full justify-start gap-2',
                      !date && 'text-muted-foreground font-medium',
                    )
                  "
                >
                  <CalendarIcon class="size-4 text-accent" />
                  {{
                    date
                      ? df.format(date.toDate(getLocalTimeZone()))
                      : "Select your birthday"
                  }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0 rounded-2xl">
                <Calendar
                  v-model="date"
                  :initial-focus="true"
                  :default-placeholder="defaultPlaceholder"
                  layout="month-and-year"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <!---------------------------------------Screen 2--------------------------------------->
        <div
          v-else-if="currentQuestion === 2 && !isLoading"
          key="2"
          class="flex flex-col items-center text-center"
        >
          <p
            class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-2"
          >
            <Icon
              name="streamline-pixel:interface-essential-information-circle-1"
              size="14"
            />
            School info
          </p>
          <h1 class="text-2xl font-black tracking-tight text-primary mb-8">
            Let's get you set up
          </h1>

          <!-- Display Name -->
          <div class="w-full mb-6 text-left">
            <Label :class="labelClass">What should others call you?</Label>
            <Input
              v-model="displayName"
              placeholder="Enter your name"
              :class="fieldClass"
            />
          </div>

          <!-- Year -->
          <div class="w-full mb-6 text-left">
            <Label :class="labelClass">Year</Label>
            <Select v-model="selectedYear">
              <SelectTrigger :class="cn(fieldClass, 'justify-between')">
                <SelectValue placeholder="Select your year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="year in yearOptions"
                  :key="year.value"
                  :value="year.value"
                >
                  {{ year.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Major -->
          <div class="w-full text-left">
            <Label :class="labelClass">Major</Label>
            <Select v-model="selectedMajor">
              <SelectTrigger :class="cn(fieldClass, 'justify-between')">
                <SelectValue placeholder="Select your major" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup v-for="group in majorOptions" :key="group.group">
                  <SelectLabel>{{ group.group }}</SelectLabel>
                  <SelectItem
                    v-for="item in group.items"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!---------------------------------------Screen 3--------------------------------------->
        <div
          v-else-if="currentQuestion === 3 && !isLoading"
          key="3"
          class="flex flex-col items-center text-center"
        >
          <p
            class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-2"
          >
            <Icon
              name="streamline-pixel:interface-essential-question-help-square"
              size="14"
            />
            Pick all that apply
          </p>
          <h1 class="text-2xl font-black tracking-tight text-primary mb-8">
            What brings you here?
          </h1>

          <!-- Goals -->
          <div class="w-full mb-6 text-left">
            <Label :class="labelClass">Goals</Label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="goal in goalOptions"
                :key="goal.id"
                type="button"
                class="h-auto py-3.5 px-3 rounded-2xl text-center cursor-pointer"
                :class="pillClass(selectedGoals.includes(goal.id))"
                @click="toggleGoal(goal.id)"
              >
                <span class="text-sm font-bold">{{ goal.label }}</span>
              </button>
            </div>
          </div>

          <!-- Vibe -->
          <div class="w-full text-left">
            <Label :class="labelClass">Your vibe</Label>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="vibe in vibeOptions"
                :key="vibe"
                variant="outline"
                class="cursor-pointer px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 hover:scale-105"
                :class="pillClass(selectedVibes.includes(vibe))"
                @click="toggleVibe(vibe)"
              >
                {{ vibe }}
              </Badge>
            </div>
          </div>
        </div>

        <!---------------------------------------Screen 4--------------------------------------->
        <div
          v-else-if="currentQuestion === 4 && !isLoading"
          key="4"
          class="flex flex-col items-center text-center w-full"
        >
          <p
            class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-2"
          >
            <Icon
              name="streamline-pixel:interface-essential-star-2"
              size="14"
            />
            Tap everything you vibe with
          </p>
          <h1 class="text-2xl font-black tracking-tight text-primary mb-6">
            What are you into?
          </h1>

          <div class="w-full text-left">
            <Accordion
              type="multiple"
              class="w-full"
              :default-value="['academic']"
            >
              <AccordionItem
                v-for="category in interestCategories"
                :key="category.id"
                :value="category.id"
                class="border-primary/10"
              >
                <AccordionTrigger class="hover:no-underline font-bold">
                  <div class="flex items-center gap-2">
                    <Icon :name="category.icon" size="16" class="text-accent" />
                    <span>{{ category.label }}</span>
                    <Badge
                      v-if="
                        selectedInterests.filter((i) =>
                          category.options.includes(i),
                        ).length > 0
                      "
                      class="ml-1 text-xs bg-accent/15 text-primary border-none"
                    >
                      {{
                        selectedInterests.filter((i) =>
                          category.options.includes(i),
                        ).length
                      }}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="flex flex-wrap gap-2 pt-2 pb-1">
                    <Badge
                      v-for="option in category.options"
                      :key="option"
                      variant="outline"
                      class="cursor-pointer px-3 py-1.5 text-sm font-bold rounded-full transition-all duration-200 hover:scale-105"
                      :class="pillClass(selectedInterests.includes(option))"
                      @click="toggleInterest(option)"
                    >
                      {{ option }}
                    </Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <!-- Custom Tags -->
            <div class="pt-4 mt-2 border-t border-primary/10">
              <Label :class="labelClass">Add your own tags</Label>
              <div class="flex gap-2 mb-3">
                <Input
                  v-model="customTag"
                  placeholder="Type a tag..."
                  :class="cn(fieldClass, 'flex-1')"
                  @keyup.enter="addCustomTag"
                />
                <Button
                  variant="outline"
                  size="icon"
                  class="h-12 w-12 rounded-2xl border-primary/10 shrink-0"
                  @click="addCustomTag"
                >
                  <Plus class="h-4 w-4" />
                </Button>
              </div>
              <div v-if="customTags.length > 0" class="flex flex-wrap gap-2">
                <Badge
                  v-for="tag in customTags"
                  :key="tag"
                  class="bg-accent/15 text-primary border-none px-3 py-1.5 text-sm font-bold rounded-full flex items-center gap-1.5"
                >
                  {{ tag }}
                  <X
                    class="h-3 w-3 cursor-pointer hover:text-destructive"
                    @click="removeCustomTag(tag)"
                  />
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <!---------------------------------------Screen 5--------------------------------------->
        <div
          v-else-if="currentQuestion === 5 && !isLoading"
          key="5"
          class="flex flex-col items-center text-center"
        >
          <p
            class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-2"
          >
            <Icon name="streamline-pixel:user-profile-focus" size="14" />
            Almost there
          </p>
          <h1 class="text-2xl font-black tracking-tight text-primary mb-8">
            Let people know what's up
          </h1>

          <!-- Profile Photo -->
          <div class="w-full mb-6 text-left">
            <div class="flex justify-center items-center mb-5">
              <div
                class="size-20 rounded-full overflow-hidden bg-secondary/30 ring-4 ring-accent/15 flex items-center justify-center"
              >
                <img
                  v-if="authUser?.oauthPhotoUrl"
                  :src="authUser.oauthPhotoUrl"
                  class="w-full h-full object-cover"
                />
                <Icon
                  v-else
                  name="material-symbols:person-heart"
                  size="36"
                  class="text-muted-foreground"
                />
              </div>
            </div>
            <Label :class="labelClass">Link to your profile picture</Label>
            <Textarea
              v-model="photoUrl"
              class="w-full rounded-2xl border-primary/10 bg-secondary/20 font-bold text-sm min-h-16 resize-none focus-visible:ring-2 focus-visible:ring-accent/40"
              placeholder="https://my.profile/aBCDeXe123"
            />
          </div>

          <!-- Bio -->
          <div class="w-full text-left">
            <div class="flex justify-between items-center mb-2.5">
              <Label :class="cn(labelClass, 'mb-0')">A short bio</Label>
              <span
                :class="
                  cn(
                    'text-xs font-bold',
                    bioLength > bioMaxLength
                      ? 'text-destructive'
                      : 'text-muted-foreground/70',
                  )
                "
              >
                {{ bioLength }}/{{ bioMaxLength }}
              </span>
            </div>
            <Textarea
              v-model="bio"
              placeholder="I'm into late night study sessions. LF study buddies..."
              :rows="4"
              :maxlength="bioMaxLength"
              class="w-full resize-none rounded-2xl border-primary/10 bg-secondary/20 font-medium text-sm focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>
        </div>

        <!---------------------------------------Screen 6--------------------------------------->
        <div
          v-else-if="currentQuestion === 6 && !isLoading"
          key="6"
          class="flex flex-col items-center text-center"
        >
          <p
            class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-2"
          >
            <Icon name="lucide:shield-check" size="14" />
            Account privacy
          </p>
          <h1 class="text-2xl font-black tracking-tight text-primary mb-8">
            Control who finds you
          </h1>

          <Card class="w-full border-primary/10 bg-secondary/20 rounded-2xl shadow-none py-5">
            <CardContent>
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1 text-left">
                  <h3 class="font-black text-sm text-primary">
                    Show profile publicly
                  </h3>
                </div>
                <Switch v-model:checked="showPublicProfile" />
              </div>
            </CardContent>
          </Card>
          <p class="text-xs font-medium text-muted-foreground mt-6 text-left leading-relaxed">
            When enabled, people can find and view your profile without
            matching first. You can change this anytime in settings.
          </p>
        </div>

        <!-- Loading -->
        <div
          v-else-if="isLoading && currentQuestion <= totalQuestion"
          key="loading"
          class="h-full flex flex-col items-center justify-center text-center"
        >
          <Icon
            name="svg-spinners:ring-resize"
            size="36"
            class="text-accent mb-6"
          />
          <h2 class="text-xl font-black tracking-tight text-primary mb-2">
            Setting things up...
          </h2>
          <p class="text-sm font-medium text-muted-foreground">
            Finding the best matches for you
          </p>
        </div>
      </Transition>
      </div>
    </div>
  </div>
</template>
