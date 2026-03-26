<script setup lang="ts">
definePageMeta({ layout: false })

const { public: { apiBase } } = useRuntimeConfig()
const { loginWithGoogle, loginWithGitHub, isAuthenticated, fetchUser } = useAuth()

const email = ref('')
const isSubmitting = ref(false)
const message = ref('')
const isError = ref(false)

async function submitEmail() {
  isSubmitting.value = true
  message.value = ''
  isError.value = false
  try {
    await $fetch(`${apiBase}/email-collection`, {
      method: 'POST',
      body: { email: email.value }
    })
    message.value = "You're on the list!"
    email.value = ''
  } catch (e) {
    isError.value = true
    message.value = 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Scroll-triggered reveals
const missionRef = ref<HTMLElement>()
const featuresRef = ref<HTMLElement>()
const interestsRef = ref<HTMLElement>()
const signupRef = ref<HTMLElement>()

const revealed = reactive({
  mission: false,
  features: false,
  interests: false,
  signup: false,
})

onMounted(() => {
  fetchUser()

  const sections: { el: HTMLElement | undefined; key: keyof typeof revealed }[] = [
    { el: missionRef.value, key: 'mission' },
    { el: featuresRef.value, key: 'features' },
    { el: interestsRef.value, key: 'interests' },
    { el: signupRef.value, key: 'signup' },
  ]
  sections.forEach(({ el, key }) => {
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry!.isIntersecting) {
        revealed[key] = true
        obs.disconnect()
      }
    }, { threshold: 0.1 })
    obs.observe(el)
  })
})

const tags = [
  { icon: 'ri:graduation-cap-fill',                        label: 'Econ Statistics',  classes: 'bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/25' },
  { icon: 'famicons:football-sharp',                        label: 'Football Friday',  classes: 'bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/25' },
  { icon: 'material-symbols:format-list-bulleted-rounded',  label: 'IELTS Prep',       classes: 'bg-violet-500/15 text-violet-400 border-violet-500/20 hover:bg-violet-500/25' },
  { icon: 'bx:bxs-coffee-alt',                             label: 'Matcha Dates',     classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25' },
  { icon: 'mdi:github',                                     label: 'Debug Together',   classes: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/25' },
  { icon: 'ri:sparkling-2-fill',                            label: 'Late Night Cram',  classes: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25' },
  { icon: 'lucide:music',                                   label: 'Study Playlist',   classes: 'bg-pink-500/15 text-pink-400 border-pink-500/20 hover:bg-pink-500/25' },
  { icon: 'lucide:coffee',                                  label: 'Coffee Runs',      classes: 'bg-orange-500/15 text-orange-400 border-orange-500/20 hover:bg-orange-500/25' },
]
</script>

<template>
  <div
    class="dark min-h-screen font-sans antialiased bg-background text-foreground dot-grid"
    style="background-color: oklch(0.11 0.005 280);"
  >
    <!-- Color blooms behind everything -->
    <div class="fixed inset-0 pointer-events-none" style="
      background:
        radial-gradient(ellipse 70% 60% at 5% 35%, oklch(0.18 0.045 285 / 50%) 0%, transparent 100%),
        radial-gradient(ellipse 50% 50% at 95% 75%, oklch(0.16 0.035 170 / 35%) 0%, transparent 100%);
    " />

    <div class="relative">
      <NavBar />

      <!-- ── HERO ─────────────────────────────────────────────── -->
      <section class="flex items-center justify-center px-4 pt-40 pb-40">
        <div class="relative">

          <Card class="relative w-full max-w-xs p-3">
            <CardContent class="p-5">
              <div class="hero-stagger" style="--i: 0">
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-8 h-8 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
                    <Icon name="ri:sparkling-2-fill" class="text-foreground" size="15" />
                  </div>
                  <span class="font-extrabold text-sm tracking-tight">Caphne</span>
                </div>
              </div>

              <div class="hero-stagger" style="--i: 1">
                <h1 class="text-4xl font-extrabold leading-[1.06] tracking-tight mb-5">
                  Find your<br>
                  <span class="text-accent">perfect</span><br>
                  studymate.
                </h1>
              </div>

              <div class="hero-stagger" style="--i: 2">
                <p class="text-sm text-muted-foreground leading-relaxed mb-10">
                  Connect with driven students in HCM City over Coursework, game, coding, anything.
                </p>
              </div>

              <div class="hero-stagger" style="--i: 3">
                <div v-if="!isAuthenticated" class="space-y-2.5">
                  <Button class="w-full h-10 font-semibold" @click="loginWithGoogle">
                    <Icon name="ri:sparkling-2-fill" size="15" />
                    Find your match
                  </Button>
                  <div class="grid grid-cols-2 gap-2">
                    <Button class="h-9 text-xs font-medium" variant="outline" @click="loginWithGoogle">
                      <Icon name="ci:google" size="14" />Google
                    </Button>
                    <Button class="h-9 text-xs font-medium" variant="outline" @click="loginWithGitHub">
                      <Icon name="ci:github" size="14" />GitHub
                    </Button>
                  </div>
                </div>
                <div v-else class="space-y-3">
                  <p class="text-sm font-semibold">Welcome back!</p>
                  <NuxtLink to="/profile">
                    <Button class="w-full h-10 font-semibold">Go to Profile</Button>
                  </NuxtLink>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- ── MISSION ──────────────────────────────────────────── -->
      <section
        ref="missionRef"
        class="max-w-4xl mx-auto px-4 pb-40 text-center transition-all duration-700 ease-out"
        :class="revealed.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">
          <Icon name="streamline-pixel:food-drink-desert-cake" size="14" class="inline mr-1.5 align-middle" />
          Our belief
        </p>
        <h2 class="text-5xl md:text-7xl font-black leading-[1.0] tracking-tight mb-8">
          The friends you make<br>
          <span class="text-accent">should feel intentional.</span>
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mb-10">
          We connect like-minded students ready to grow together — over books, code, coffee, and everything in between.
        </p>
        <Button size="lg" class="h-11 px-8 font-semibold" @click="loginWithGoogle">
          <Icon name="ri:sparkling-2-fill" size="15" />
          Connect today
        </Button>
      </section>

      <!-- ── FEATURES ─────────────────────────────────────────── -->
      <section ref="featuresRef" class="max-w-3xl mx-auto px-4 pb-40">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Studydate -->
          <Card
            class="overflow-hidden group transition-all duration-500 ease-out p-0"
            :class="revealed.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            :style="{ transitionDelay: '100ms' }"
          >
            <div class="h-56 relative overflow-hidden">
              <img
                src="/placeholder-4.png"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/25 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Study Dates
              </span>
            </div>
            <CardContent class="p-6 -mt-2">
              <h3 class="text-xl font-extrabold mb-2">Find your Studydate</h3>
              <p class="text-sm text-muted-foreground leading-relaxed mb-5">
                Get help, give help, or just make the grind less lonely.
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[11px] font-semibold hover:bg-blue-500/25 transition-colors"
                  @click="loginWithGoogle"
                >
                  <Icon name="ri:graduation-cap-fill" size="11" />Chat & study
                </button>
                <button
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/25 transition-colors"
                  @click="loginWithGoogle"
                >
                  <Icon name="bx:bxs-coffee-alt" size="11" />Chill over Matcha
                </button>
              </div>
            </CardContent>
          </Card>

          <!-- BFF -->
          <Card
            class="overflow-hidden group card-glow transition-all duration-500 ease-out p-0"
            :class="revealed.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            :style="{ transitionDelay: '250ms' }"
          >
            <div class="h-56 relative overflow-hidden">
              <img
                src="/placeholder-2.png"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div class="absolute inset-0 bg-linear-to-t from-card via-card/30 to-transparent" />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/25 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Builder Friends
              </span>
            </div>
            <CardContent class="p-6 -mt-2">
              <h3 class="text-xl font-extrabold mb-2">
                Find your BFF
                <span class="text-muted-foreground text-sm font-normal"> (Builder Friend Forever)</span>
              </h3>
              <p class="text-sm text-muted-foreground leading-relaxed mb-5">
                New to HCM City? Connect with driven builders who make things happen.
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-500/15 border border-zinc-500/20 text-zinc-400 text-[11px] font-semibold hover:bg-zinc-500/25 transition-colors"
                  @click="loginWithGoogle"
                >
                  <Icon name="ci:github" size="11" />Geek over Code
                </button>
                <button
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/20 text-green-400 text-[11px] font-semibold hover:bg-green-500/25 transition-colors"
                  @click="loginWithGoogle"
                >
                  <Icon name="famicons:football-sharp" size="11" />Football Friday
                </button>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <!-- ── INTERESTS ────────────────────────────────────────── -->
      <section
        ref="interestsRef"
        class="max-w-3xl mx-auto px-4 pb-40 transition-all duration-700 ease-out"
        :class="revealed.interests ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
            <Icon name="streamline-pixel:interface-essential-star-2" size="14" class="inline mr-1.5 align-middle" />
            Shared interests
          </p>
          <h3 class="text-3xl font-extrabold leading-tight mb-2">Start the conversation.</h3>
          <p class="text-sm text-muted-foreground mb-8">Bond online. Continue in person.</p>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="tag in tags"
              :key="tag.label"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-colors"
              :class="tag.classes"
              @click="loginWithGoogle"
            >
              <Icon :name="tag.icon" size="13" />{{ tag.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── SIGNUP ───────────────────────────────────────────── -->
      <section
        id="signup"
        ref="signupRef"
        class="flex justify-center px-4 pb-40 transition-all duration-700 ease-out"
        :class="revealed.signup ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div class="relative">
          <div
            class="absolute -inset-16 rounded-full blur-3xl pointer-events-none glow-pulse"
            style="background: radial-gradient(circle, oklch(0.45 0.12 170), transparent);"
          />

          <Card class="relative w-full max-w-xs card-glow">
            <CardContent class="p-8">
              <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                <Icon name="streamline-pixel:interface-essential-information-circle-1" size="14" class="inline mr-1.5 align-middle" />
                Stay in the loop
              </p>
              <h3 class="text-2xl font-extrabold leading-tight mb-2">Get email updates.</h3>
              <p class="text-sm text-muted-foreground leading-relaxed mb-8">New features, events, and stories — no spam.</p>
              <form class="flex flex-col gap-3" @submit.prevent="submitEmail">
                <input
                  v-model="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  class="w-full px-4 h-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="submit" :disabled="isSubmitting" class="h-10 w-full font-semibold">
                  <Icon v-if="isSubmitting" name="mdi:loading" size="15" class="animate-spin" />
                  <span v-else>Notify me</span>
                </Button>
              </form>
              <p v-if="message" class="mt-3 text-xs" :class="isError ? 'text-red-400' : 'text-green-400'">
                {{ message }}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- ── FOOTER ───────────────────────────────────────────── -->
      <footer class="pb-10 px-4">
        <div class="max-w-3xl mx-auto">
          <div class="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-lg bg-foreground/10 flex items-center justify-center">
                <Icon name="ri:sparkling-2-fill" class="text-foreground" size="10" />
              </div>
              <span class="font-bold">Caphne</span>
            </div>
            <div class="flex items-center gap-4">
              <a
                href="https://github.com/suka712/caphne-studybuddy"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-foreground transition-colors"
              >
                <Icon name="ci:github" size="16" />
              </a>
              <span>Made with ♥ in HCM City</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Subtle dot grid across the entire page */
.dot-grid {
  background-image: radial-gradient(circle, oklch(1 0 0 / 0.04) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Soft outer glow on cards to lift them off the background */
.card-glow {
  box-shadow:
    0 0 0 1px oklch(1 0 0 / 0.06),
    0 0 20px -4px oklch(1 0 0 / 0.06),
    0 0 50px -8px oklch(0.5 0.12 285 / 0.08);
}

.hero-stagger {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: calc(var(--i) * 0.1s + 0.3s);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glow-pulse {
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.3; }
}
</style>
