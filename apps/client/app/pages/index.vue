<script setup lang="ts">
definePageMeta({ layout: false });

const {
  public: { apiBase },
} = useRuntimeConfig();
const { loginWithGoogle, loginWithGitHub, isAuthenticated, fetchUser } =
  useAuth();

const email = ref("");
const isSubmitting = ref(false);
const message = ref("");
const isError = ref(false);

async function submitEmail() {
  isSubmitting.value = true;
  message.value = "";
  isError.value = false;
  try {
    await $fetch(`${apiBase}/email-collection`, {
      method: "POST",
      body: { email: email.value },
    });
    message.value = "You're on the list!";
    email.value = "";
  } catch (e) {
    isError.value = true;
    message.value = "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}

const flowRef = ref<HTMLElement>();
const signupRef = ref<HTMLElement>();

const revealed = reactive({
  flow: false,
  signup: false,
});

const userCount = ref<number | null>(null);

async function fetchUserCount() {
  try {
    const data = await $fetch<{ count: number }>(`${apiBase}/profile/count`);
    userCount.value = data.count;
  } catch {
    userCount.value = null;
  }
}

onMounted(() => {
  fetchUser();
  fetchUserCount();

  const sections: {
    el: HTMLElement | undefined;
    key: keyof typeof revealed;
  }[] = [
    { el: flowRef.value, key: "flow" },
    { el: signupRef.value, key: "signup" },
  ];
  sections.forEach(({ el, key }) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          revealed[key] = true;
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
  });
});

const demoMatches = [
  {
    name: "Linh",
    sub: "Econ · Y2",
    color: "from-amber-400 to-rose-400",
    online: true,
    unread: 2,
  },
  {
    name: "Minh",
    sub: "CS · Y3",
    color: "from-sky-400 to-violet-400",
    online: true,
    unread: 0,
  },
  {
    name: "Trang",
    sub: "Design · Y1",
    color: "from-emerald-400 to-teal-400",
    online: false,
    unread: 0,
  },
];

const demoMessages = [
  { from: "them", text: "matcha at The Workshop?", time: "2:14" },
  { from: "me", text: "be there in 10", time: "2:15" },
  { from: "them", text: "bring the stats notes?", time: "2:16" },
  { from: "me", text: "on it", time: "2:16" },
];
</script>

<template>
  <div
    class="relative min-h-screen font-sans antialiased landing-theme"
  >
    <!-- Soft cream/honey blooms -->
    <div class="pointer-events-none fixed inset-0 -z-10">
      <div
        class="absolute -top-32 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-60"
        style="background: radial-gradient(closest-side, oklch(0.92 0.12 90), transparent 70%)"
      />
      <div
        class="absolute top-1/3 -right-32 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-50"
        style="background: radial-gradient(closest-side, oklch(0.90 0.10 70), transparent 70%)"
      />
      <div
        class="absolute bottom-0 left-1/2 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-40"
        style="background: radial-gradient(closest-side, oklch(0.92 0.08 50), transparent 70%)"
      />
    </div>

    <NavBar />

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section
      class="max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-28 md:pb-40 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20 items-center"
    >
      <div class="order-2 lg:order-1">
        <div class="hero-stagger" style="--i: 0">
          <p
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coffee-900/5 border border-coffee-900/10 text-coffee-800 text-[11px] font-bold uppercase tracking-[0.18em] mb-7"
          >
            <Icon name="lucide:map-pin" size="12" class="text-honey-600" />
            Ho Chi Minh City
          </p>
        </div>
        <div class="hero-stagger" style="--i: 1">
          <h1
            class="text-[clamp(2.6rem,6vw,4.8rem)] font-black leading-[0.95] tracking-tight text-coffee-900 mb-7"
          >
            Where
            <span class="font-serif-display italic text-honey-600">ambition</span><br />
            meets
            <span class="font-serif-display italic text-honey-600">matcha</span>.
          </h1>
        </div>
        <div class="hero-stagger" style="--i: 2">
          <p
            class="text-base md:text-lg text-coffee-700/80 leading-relaxed max-w-md mb-10"
          >
            Caphne connects students in Ho Chi Minh City — for coursework,
            side projects, and the next coffee run.
          </p>
        </div>
        <div
          v-if="userCount && userCount > 0"
          class="hero-stagger"
          style="--i: 3"
        >
          <div class="flex items-center gap-6 text-sm text-coffee-700/65">
            <div class="flex items-center gap-2.5">
              <div class="flex -space-x-2">
                <div class="size-7 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 ring-2 ring-cream-50" />
                <div class="size-7 rounded-full bg-gradient-to-br from-sky-300 to-violet-400 ring-2 ring-cream-50" />
                <div class="size-7 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 ring-2 ring-cream-50" />
              </div>
              <span>
                <span class="font-semibold text-coffee-900"
                  >{{ userCount }} students</span
                >
                already in
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero card — restyled in the new cream theme -->
      <div class="order-1 lg:order-2 flex justify-center lg:justify-end">
        <div
          class="hero-stagger relative w-full max-w-sm rounded-3xl bg-cream-50 border border-coffee-900/10 p-7 shadow-[0_30px_60px_-30px_rgba(80,50,20,0.25)]"
          style="--i: 1"
        >
          <div class="flex items-center justify-between mb-7">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-coffee-900 flex items-center justify-center"
              >
                <Icon
                  name="ri:sparkling-2-fill"
                  class="text-honey-300"
                  size="14"
                />
              </div>
              <span class="font-extrabold text-sm tracking-tight text-coffee-900"
                >Caphne</span
              >
            </div>
            <span
              class="text-[10px] font-medium uppercase tracking-[0.18em] text-coffee-600/70"
            >
              No. 0301
            </span>
          </div>

          <h2
            class="text-3xl font-extrabold leading-[1.05] tracking-tight text-coffee-900 mb-3"
          >
            Find your<br />
            <span class="font-serif-display italic text-honey-600">studybuddy</span>.
          </h2>
          <p class="text-sm text-coffee-700/70 leading-relaxed mb-7">
            Sign in. We'll take it from there.
          </p>

          <div v-if="!isAuthenticated" class="space-y-2.5">
            <button
              class="w-full h-11 rounded-xl bg-coffee-900 text-cream-50 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-coffee-800 transition-colors"
              @click="loginWithGoogle"
            >
              <Icon name="ri:sparkling-2-fill" size="15" />
              Find your match
            </button>
            <div class="grid grid-cols-2 gap-2">
              <button
                class="h-10 rounded-xl border border-coffee-900/15 bg-transparent text-coffee-800 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-coffee-900/5 transition-colors"
                @click="loginWithGoogle"
              >
                <Icon name="ci:google" size="14" />Google
              </button>
              <button
                class="h-10 rounded-xl border border-coffee-900/15 bg-transparent text-coffee-800 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-coffee-900/5 transition-colors"
                @click="loginWithGitHub"
              >
                <Icon name="ci:github" size="14" />GitHub
              </button>
            </div>
          </div>
          <div v-else class="space-y-3">
            <p class="text-sm font-semibold text-coffee-900">Welcome back.</p>
            <NuxtLink to="/profile">
              <button
                class="w-full h-11 rounded-xl bg-coffee-900 text-cream-50 font-semibold text-sm hover:bg-coffee-800 transition-colors"
              >
                Go to profile
              </button>
            </NuxtLink>
          </div>

          <div
            class="mt-7 pt-5 border-t border-dashed border-coffee-900/15 flex items-center justify-between text-[11px] text-coffee-600/70"
          >
            <span>Free to join</span>
            <span class="flex items-center gap-1">
              <Icon name="lucide:shield-check" size="11" />
              .edu friendly
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ─────────────────────────────────────── -->
    <section
      ref="flowRef"
      class="max-w-6xl mx-auto px-6 pb-32 md:pb-44 transition-all duration-700 ease-out"
      :class="
        revealed.flow
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      "
    >
      <div class="text-center max-w-2xl mx-auto mb-16">
        <p
          class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-coffee-700/70 mb-5"
        >
          <span class="h-px w-8 bg-coffee-700/30" />
          How it works
          <span class="h-px w-8 bg-coffee-700/30" />
        </p>
        <h2
          class="text-4xl md:text-5xl font-black leading-tight tracking-tight text-coffee-900 mb-5"
        >
          Three steps.<br />
          The rest is up to you.
        </h2>
      </div>

      <div class="relative">
        <div
          class="hidden md:block absolute top-[40%] left-[14%] right-[14%] -translate-y-1/2 h-px border-t border-dashed border-coffee-900/15 z-0"
        />

        <div
          class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 items-start"
        >
          <!-- Step 1 — Onboarding -->
          <div
            class="flow-step transition-all duration-700 ease-out"
            :class="
              revealed.flow
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            "
            :style="{ transitionDelay: '100ms' }"
          >
            <div class="phone-frame mx-auto">
              <div class="phone-notch" />
              <div class="phone-screen dark p-4 flex flex-col gap-4">
                <div class="text-center pt-1">
                  <p class="text-[10px] text-neutral-400 flex items-center justify-center gap-1 mb-1">
                    <Icon name="streamline-pixel:food-drink-desert-cake" size="11" />
                    Let's get started
                  </p>
                  <h3 class="text-base font-bold text-neutral-50">Tell us about you</h3>
                </div>
                <div>
                  <p class="text-[10px] text-neutral-400 mb-2">Your gender</p>
                  <div class="grid grid-cols-3 gap-1.5">
                    <div class="aspect-square rounded-md border border-neutral-700 flex flex-col items-center justify-center gap-0.5 text-neutral-300">
                      <Icon name="streamline-pixel:user-gender-male" size="16" />
                      <span class="text-[8px]">Male</span>
                    </div>
                    <div class="aspect-square rounded-md bg-neutral-100 text-neutral-900 flex flex-col items-center justify-center gap-0.5">
                      <Icon name="streamline-pixel:user-gender-female" size="16" />
                      <span class="text-[8px] font-semibold">Female</span>
                    </div>
                    <div class="aspect-square rounded-md border border-neutral-700 flex flex-col items-center justify-center gap-0.5 text-neutral-300">
                      <Icon name="streamline-pixel:interface-essential-question-help-square" size="16" />
                      <span class="text-[8px]">Other</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p class="text-[10px] text-neutral-400 mb-2">Major</p>
                  <div class="h-7 rounded-md border border-neutral-700 flex items-center px-2.5 text-[10px] text-neutral-200">
                    Economics &amp; Statistics
                  </div>
                </div>
                <div>
                  <p class="text-[10px] text-neutral-400 mb-2">Your vibe</p>
                  <div class="flex flex-wrap gap-1">
                    <span class="text-[9px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-900 font-semibold">Night owl</span>
                    <span class="text-[9px] px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-300">Caffeinated</span>
                    <span class="text-[9px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-900 font-semibold">Builder</span>
                    <span class="text-[9px] px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-300">Grinder</span>
                  </div>
                </div>
                <div class="mt-auto h-1 rounded-full bg-neutral-800 overflow-hidden">
                  <div class="h-full w-1/3 bg-neutral-100" />
                </div>
              </div>
            </div>
            <div class="text-center mt-7">
              <p class="text-xs font-bold uppercase tracking-[0.22em] text-honey-600 mb-2">
                01
              </p>
              <h4 class="text-lg font-bold text-coffee-900 mb-1">Build your profile</h4>
              <p class="text-sm text-coffee-700/65 max-w-[18rem] mx-auto">
                Six quick taps — major, year, what you're into.
              </p>
            </div>
          </div>

          <!-- Step 2 — Matches -->
          <div
            class="flow-step transition-all duration-700 ease-out"
            :class="
              revealed.flow
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            "
            :style="{ transitionDelay: '250ms' }"
          >
            <div class="phone-frame mx-auto">
              <div class="phone-notch" />
              <div class="phone-screen dark flex flex-col">
                <div class="flex items-center justify-between px-3 py-2.5 border-b border-neutral-800">
                  <div class="flex items-center gap-2">
                    <div class="size-7 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 ring-1 ring-neutral-100" />
                    <span class="text-xs font-bold text-neutral-50">You</span>
                  </div>
                  <div class="h-5 px-2 rounded-md border border-neutral-700 flex items-center text-[9px] font-medium text-neutral-300">
                    New match
                  </div>
                </div>
                <div class="flex-1 p-2.5 space-y-1.5">
                  <div
                    v-for="(m, i) in demoMatches"
                    :key="i"
                    class="flex items-center gap-2 p-1.5 rounded-full bg-neutral-800"
                  >
                    <div class="relative shrink-0">
                      <div :class="['size-7 rounded-full bg-gradient-to-br', m.color]" />
                      <span
                        class="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-neutral-800"
                        :class="m.online ? 'bg-emerald-400' : 'bg-neutral-500'"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[10px] font-semibold text-neutral-50 leading-tight">{{ m.name }}</p>
                      <p class="text-[8px] text-neutral-400 leading-tight">{{ m.sub }}</p>
                    </div>
                    <div
                      v-if="m.unread"
                      class="size-4 rounded-full bg-neutral-100 text-neutral-900 text-[8px] font-bold flex items-center justify-center"
                    >
                      {{ m.unread }}
                    </div>
                  </div>
                </div>
                <div class="p-2 border-t border-neutral-800">
                  <div class="h-6 rounded-md border border-neutral-700 flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                    <Icon name="material-symbols:person" size="11" />
                    Profile
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center mt-7">
              <p class="text-xs font-bold uppercase tracking-[0.22em] text-honey-600 mb-2">
                02
              </p>
              <h4 class="text-lg font-bold text-coffee-900 mb-1">Find your matches</h4>
              <p class="text-sm text-coffee-700/65 max-w-[18rem] mx-auto">
                Hand-picked people in your area, refreshed daily.
              </p>
            </div>
          </div>

          <!-- Step 3 — Chat -->
          <div
            class="flow-step transition-all duration-700 ease-out"
            :class="
              revealed.flow
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            "
            :style="{ transitionDelay: '400ms' }"
          >
            <div class="phone-frame mx-auto">
              <div class="phone-notch" />
              <div class="phone-screen dark flex flex-col">
                <div class="flex items-center gap-2 px-3 py-2 border-b border-neutral-800">
                  <Icon name="mdi:arrow-left" size="14" class="text-neutral-400" />
                  <div class="size-7 rounded-full bg-gradient-to-br from-amber-300 to-rose-400" />
                  <div class="min-w-0">
                    <p class="text-[10px] font-semibold text-neutral-50 leading-tight">Linh</p>
                    <p class="text-[8px] text-emerald-400 leading-tight">Online</p>
                  </div>
                </div>
                <div class="flex-1 p-2.5 space-y-1.5 overflow-hidden">
                  <div
                    v-for="(msg, i) in demoMessages"
                    :key="i"
                    :class="[
                      'max-w-[78%] rounded-lg px-2 py-1 text-[10px] leading-snug',
                      msg.from === 'me'
                        ? 'ml-auto bg-neutral-100 text-neutral-900'
                        : 'mr-auto bg-neutral-800 text-neutral-100',
                    ]"
                  >
                    <p>{{ msg.text }}</p>
                    <p class="text-[7px] opacity-60 mt-0.5">{{ msg.time }}</p>
                  </div>
                </div>
                <div class="p-2 border-t border-neutral-800 flex gap-1.5">
                  <div class="flex-1 h-6 rounded-md border border-neutral-700 flex items-center px-2 text-[9px] text-neutral-400">
                    Type a message…
                  </div>
                  <div class="size-6 rounded-md bg-neutral-100 flex items-center justify-center">
                    <Icon name="mingcute:send-fill" size="11" class="text-neutral-900" />
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center mt-7">
              <p class="text-xs font-bold uppercase tracking-[0.22em] text-honey-600 mb-2">
                03
              </p>
              <h4 class="text-lg font-bold text-coffee-900 mb-1">Take it offline</h4>
              <p class="text-sm text-coffee-700/65 max-w-[18rem] mx-auto">
                Chat, plan, then meet at the café around the corner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SIGNUP ───────────────────────────────────────────── -->
    <section
      id="signup"
      ref="signupRef"
      class="max-w-5xl mx-auto px-6 pb-32 transition-all duration-700 ease-out"
      :class="
        revealed.signup
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6'
      "
    >
      <div
        class="relative overflow-hidden rounded-3xl border border-coffee-900/10 bg-cream-50/80 backdrop-blur-sm p-8 md:p-14"
      >
        <div
          class="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-60"
          style="background: radial-gradient(closest-side, oklch(0.92 0.12 90), transparent 70%)"
        />
        <div class="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p
              class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-coffee-700/70 mb-5"
            >
              <Icon name="streamline-pixel:interface-essential-information-circle-1" size="14" />
              Stay close
            </p>
            <h3
              class="text-3xl md:text-4xl font-black leading-tight tracking-tight text-coffee-900 mb-4"
            >
              Don't miss
              <span class="font-serif-display italic text-honey-600">what's next</span>.
            </h3>
            <p class="text-coffee-700/75 text-sm md:text-base leading-relaxed">
              The occasional update — features we ship, meetups in Saigon.
              Nothing else.
            </p>
          </div>
          <form class="flex flex-col gap-3" @submit.prevent="submitEmail">
            <div class="relative">
              <Icon
                name="lucide:mail"
                size="16"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-600/60"
              />
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                class="w-full pl-10 pr-4 h-12 rounded-xl border border-coffee-900/15 bg-cream-50 text-sm text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-honey-500/40 focus:border-honey-500/40 transition-all"
              />
            </div>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="h-12 w-full font-semibold rounded-xl bg-coffee-900 text-cream-50 hover:bg-coffee-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Icon
                v-if="isSubmitting"
                name="mdi:loading"
                size="16"
                class="animate-spin"
              />
              <span v-else class="flex items-center gap-2">
                Keep me posted
                <Icon name="lucide:arrow-right" size="15" />
              </span>
            </button>
            <p
              v-if="message"
              class="text-xs"
              :class="isError ? 'text-red-500' : 'text-emerald-600'"
            >
              {{ message }}
            </p>
            <p v-else class="text-[11px] text-coffee-600/55">
              No spam. No socials. Promise.
            </p>
          </form>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ───────────────────────────────────────────── -->
    <footer class="pb-10 px-6">
      <div class="max-w-6xl mx-auto">
        <div
          class="h-px mb-8"
          style="background: linear-gradient(to right, transparent, oklch(0.24 0.03 50 / 0.15), transparent)"
        />
        <div
          class="flex items-center justify-between text-xs text-coffee-700/60 flex-wrap gap-4"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-5 h-5 rounded-lg bg-coffee-900 flex items-center justify-center"
            >
              <Icon
                name="ri:sparkling-2-fill"
                class="text-honey-300"
                size="10"
              />
            </div>
            <span class="font-bold text-coffee-900">Caphne</span>
            <span class="text-coffee-700/30">·</span>
            <span>Made in HCM City</span>
          </div>
          <div class="flex items-center gap-4">
            <a
              href="https://github.com/suka712/caphne-studybuddy"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-coffee-900 transition-colors"
            >
              <Icon name="ci:github" size="16" />
            </a>
            <span>© {{ new Date().getFullYear() }} Caphne</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing-theme {
  /* Cream / butter base */
  background-color: oklch(0.97 0.022 88);
  color: oklch(0.25 0.025 50);
}

/* Palette helpers — tailwind v4 picks these up via arbitrary props,
   but we expose them as utility-named classes for the template. */
:deep(.text-coffee-900),
.text-coffee-900 { color: oklch(0.24 0.03 50); }
:deep(.text-coffee-800),
.text-coffee-800 { color: oklch(0.32 0.03 50); }
:deep(.text-coffee-700),
.text-coffee-700 { color: oklch(0.40 0.025 55); }
:deep(.text-coffee-600),
.text-coffee-600 { color: oklch(0.50 0.02 55); }
:deep(.text-honey-600),
.text-honey-600 { color: oklch(0.62 0.16 65); }
:deep(.text-honey-300),
.text-honey-300 { color: oklch(0.88 0.10 90); }

.bg-coffee-900 { background-color: oklch(0.24 0.03 50); }
.bg-coffee-800 { background-color: oklch(0.32 0.03 50); }
.bg-cream-50 { background-color: oklch(0.985 0.012 88); }

:deep(.text-cream-50),
.text-cream-50 { color: oklch(0.985 0.012 88); }

.hover\:bg-coffee-800:hover { background-color: oklch(0.32 0.03 50); }
.hover\:bg-coffee-900\/5:hover { background-color: oklch(0.24 0.03 50 / 0.05); }
.hover\:text-coffee-900:hover { color: oklch(0.24 0.03 50); }

.border-coffee-900\/10 { border-color: oklch(0.24 0.03 50 / 0.10); }
.border-coffee-900\/15 { border-color: oklch(0.24 0.03 50 / 0.15); }
.via-coffee-900\/15 { --tw-gradient-via: oklch(0.24 0.03 50 / 0.15); }
.bg-coffee-900\/5 { background-color: oklch(0.24 0.03 50 / 0.05); }

.ring-cream-50 { --tw-ring-color: oklch(0.985 0.012 88); }
.bg-cream-50\/80 { background-color: oklch(0.985 0.012 88 / 0.8); }

.focus\:ring-honey-500\/40:focus { --tw-ring-color: oklch(0.72 0.16 70 / 0.4); }
.focus\:border-honey-500\/40:focus { border-color: oklch(0.72 0.16 70 / 0.4); }

.font-serif-display {
  font-family: "Cormorant Garamond", "Playfair Display", Georgia, serif;
  font-style: italic;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* Phone bezel */
.phone-frame {
  position: relative;
  width: 15rem;
  padding: 0.55rem;
  border-radius: 2rem;
  background: linear-gradient(
    155deg,
    oklch(0.32 0.02 50) 0%,
    oklch(0.18 0.015 50) 50%,
    oklch(0.28 0.02 50) 100%
  );
  box-shadow:
    0 0 0 1.5px oklch(1 0 0 / 0.06),
    0 30px 70px -25px oklch(0.30 0.05 50 / 0.45),
    0 10px 30px -10px oklch(0.62 0.16 65 / 0.20);
}

.phone-notch {
  position: absolute;
  top: 0.55rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3.5rem;
  height: 0.9rem;
  background: oklch(0.1 0.01 50);
  border-radius: 999px;
  z-index: 2;
}

.phone-screen {
  position: relative;
  border-radius: 1.5rem;
  background: oklch(0.16 0.012 50);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.04);
  min-height: 22rem;
}

.flow-step .phone-frame {
  transition: transform 500ms ease;
}
.flow-step:hover .phone-frame {
  transform: translateY(-6px) rotate(-0.3deg);
}

.hero-stagger {
  opacity: 0;
  animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--i) * 0.1s + 0.2s);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
