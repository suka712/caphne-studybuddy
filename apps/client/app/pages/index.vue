<script setup lang="ts">
definePageMeta({ layout: "default" });

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
  } catch {
    isError.value = true;
    message.value = "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}

const vibeRef = ref<HTMLElement>();
const signupRef = ref<HTMLElement>();
const pairsRef = ref<HTMLElement>();

const revealed = reactive({
  vibe: false,
  signup: false,
  pairs: false,
});

onMounted(() => {
  fetchUser();

  const sections: {
    el: HTMLElement | undefined;
    key: keyof typeof revealed;
  }[] = [
    { el: vibeRef.value, key: "vibe" },
    { el: signupRef.value, key: "signup" },
    { el: pairsRef.value, key: "pairs" },
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
</script>

<template>
  <div class="relative pt-12 md:pt-28">
    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 mb-32 md:mb-48">
      <div
        class="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center"
      >
        <div class="space-y-8">
          <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-[0.2em]"
            >
              <Icon name="lucide:map-pin" size="12" />
              Ho Chi Minh City
            </span>
          </div>

          <h1
            class="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight text-primary animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100"
          >
            Where <span class="font-serif italic text-accent">ambition</span
            ><br />
            meets <span class="font-serif italic text-accent">matcha</span>.
          </h1>

          <p
            class="text-xl text-muted-foreground leading-relaxed max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200"
          >
            A studybuddy app for students in Saigon. Cram for midterms, crack
            problem sets, and survive group projects together.
          </p>

          <div
            class="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300"
          >
            <div class="flex -space-x-3">
              <div
                v-for="i in 3"
                :key="i"
                class="size-9 rounded-full border-2 border-background overflow-hidden bg-secondary"
              >
                <img
                  :src="`/placeholder-${i}.png`"
                  alt=""
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            <p class="text-sm font-semibold text-muted-foreground">
              <span class="text-primary font-bold">300+ students</span> already
              matched
            </p>
          </div>
        </div>

        <!-- The App Hero Card (The Centerpiece) -->
        <div
          class="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-1000 delay-300"
        >
          <div
            class="w-full max-w-sm glass rounded-[2.5rem] p-8 shadow-2xl border-primary/10 relative overflow-hidden"
          >
            <!-- Decorative Accent -->
            <div
              class="absolute -top-10 -right-10 size-32 bg-accent/20 blur-3xl rounded-full"
            />

            <div class="flex items-center gap-3 mb-8">
              <div
                class="size-10 rounded-xl bg-primary flex items-center justify-center"
              >
                <Icon
                  name="ri:sparkling-2-fill"
                  class="text-accent"
                  size="18"
                />
              </div>
              <span class="font-black text-lg tracking-tight font-serif italic"
                >Caphne</span
              >
            </div>

            <h2 class="text-3xl font-black leading-tight mb-3">
              Find your<br />
              <span class="font-serif italic text-accent">studybuddy</span>.
            </h2>
            <p class="text-sm text-muted-foreground leading-relaxed mb-8">
              Sign in to start matching with students near you based on your
              major and goals.
            </p>

            <div v-if="!isAuthenticated" class="space-y-3">
              <Button
                @click="loginWithGoogle"
                size="lg"
                class="w-full h-14 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/10"
              >
                <Icon
                  name="ri:sparkling-2-fill"
                  size="16"
                  class="text-accent"
                />
                Find your match
              </Button>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  @click="loginWithGoogle"
                  variant="outline"
                  class="h-12 rounded-xl text-xs font-bold gap-2"
                >
                  <Icon name="ci:google" size="14" /> Google
                </Button>
                <Button
                  @click="loginWithGitHub"
                  variant="outline"
                  class="h-12 rounded-xl text-xs font-bold gap-2"
                >
                  <Icon name="ci:github" size="14" /> GitHub
                </Button>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                <p class="text-sm font-bold text-primary">Welcome back.</p>
                <p class="text-xs text-muted-foreground">
                  You have new matches waiting.
                </p>
              </div>
              <NuxtLink to="/profile">
                <Button class="w-full h-14 rounded-2xl font-bold"
                  >Go to Profile</Button
                >
              </NuxtLink>
            </div>

            <div
              class="mt-8 pt-6 border-t border-dashed border-primary/10 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60"
            >
              <span>Free to join</span>
              <span class="flex items-center gap-1.5">
                <Icon name="lucide:shield-check" size="12" />
                .edu verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── VIBE ─────────────────────────────────────────────── -->
    <section
      ref="vibeRef"
      class="max-w-7xl mx-auto px-4 mb-32 md:mb-48 transition-all duration-1000 ease-out"
      :class="
        revealed.vibe ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      "
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div class="order-2 md:order-1 relative">
          <div
            class="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-background"
          >
            <img src="/placeholder-4.png" class="w-full h-full object-cover" />
          </div>
          <div
            class="absolute -bottom-8 -right-8 w-1/2 aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-8 border-background"
          >
            <img src="/placeholder-2.png" class="w-full h-full object-cover" />
          </div>
        </div>

        <div class="order-1 md:order-2">
          <h2 class="text-5xl md:text-6xl font-black leading-[1.05] mb-8">
            Better with<br />
            <span class="font-serif italic text-accent">someone</span> there.
          </h2>
          <p
            class="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md"
          >
            Caphne is for the late library nights, the assignments due tomorrow,
            and the cafes that stay open past midnight. Don't study alone when
            you don't have to.
          </p>
          <Button
            @click="loginWithGoogle"
            size="lg"
            class="h-14 px-8 rounded-2xl font-bold gap-2"
          >
            Find a studybuddy
            <Icon name="lucide:arrow-right" size="16" />
          </Button>
        </div>
      </div>
    </section>

    <!-- ── PAIRS (THE UTILITY) ──────────────────────────────── -->
    <section
      ref="pairsRef"
      class="max-w-7xl mx-auto px-4 mb-32 md:mb-48 transition-all duration-1000"
      :class="
        revealed.pairs
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12'
      "
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <!-- BFF Card -->
        <div class="group flex flex-col">
          <div
            class="aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl transition-transform duration-500 border-8 border-background"
          >
            <img src="/placeholder-1.png" class="w-full h-full object-cover" />
          </div>
          <span
            class="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-3"
          >
            <Icon name="lucide:code" size="13" />
            Builder Friend Forever
          </span>
          <h3 class="text-3xl font-black mb-4">
            Find your <span class="font-serif italic text-accent">BFF</span>.
          </h3>
          <p class="text-muted-foreground leading-relaxed mb-8 max-w-md">
            For side projects, hackathons, and the weekends you'd otherwise
            spend debugging alone. Match with other developers and designers.
          </p>
          <div class="mt-auto">
            <Button
              variant="outline"
              @click="loginWithGoogle"
              class="h-12 rounded-xl font-bold px-6 group/btn"
            >
              Find a builder
              <Icon
                name="lucide:arrow-right"
                size="14"
                class="ml-2 group-hover/btn:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>

        <!-- Coffee Date Card -->
        <div class="group flex flex-col">
          <div
            class="aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl transition-transform duration-500 border-8 border-background"
          >
            <img src="/placeholder-3.png" class="w-full h-full object-cover" />
          </div>
          <span
            class="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-3"
          >
            <Icon name="lucide:coffee" size="13" />
            Coffee Date
          </span>
          <h3 class="text-3xl font-black mb-4">
            Or just a
            <span class="font-serif italic text-accent">coffee date</span>.
          </h3>
          <p class="text-muted-foreground leading-relaxed mb-8 max-w-md">
            Sometimes a study session is really just an excuse for cà phê. Find
            someone to share a table with at your favorite local spot.
          </p>
          <div class="mt-auto">
            <Button
              variant="outline"
              @click="loginWithGoogle"
              class="h-12 rounded-xl font-bold px-6 group/btn"
            >
              Find a coffee buddy
              <Icon
                name="lucide:arrow-right"
                size="14"
                class="ml-2 group-hover/btn:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SIGNUP ───────────────────────────────────────────── -->
    <section
      id="signup"
      ref="signupRef"
      class="max-w-5xl mx-auto px-4 mb-24 transition-all duration-1000 ease-out"
      :class="
        revealed.signup
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12'
      "
    >
      <div
        class="relative overflow-hidden rounded-[3rem] bg-secondary/50 p-8 md:p-16 border border-border/50"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span
              class="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4"
            >
              <Icon name="lucide:mail" size="13" />
              Newsletter
            </span>
            <h2 class="text-4xl font-black mb-4">
              Updates, when
              <span class="font-serif italic text-accent">they matter</span>.
            </h2>
            <p class="text-muted-foreground leading-relaxed">
              New features and study meetups around Saigon. No spam, just the
              good stuff.
            </p>
          </div>

          <form @submit.prevent="submitEmail" class="space-y-3">
            <div class="relative">
              <Icon
                name="lucide:mail"
                class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size="18"
              />
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                class="w-full h-14 pl-12 pr-4 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
            </div>
            <Button
              type="submit"
              :disabled="isSubmitting"
              class="w-full h-14 rounded-2xl font-bold"
            >
              {{ isSubmitting ? "Joining..." : "Keep me posted" }}
            </Button>
            <p
              v-if="message"
              class="text-center text-sm font-bold mt-2"
              :class="isError ? 'text-destructive' : 'text-emerald-600'"
            >
              {{ message }}
            </p>
          </form>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ───────────────────────────────────────────── -->
    <footer class="pb-20 px-4">
      <div class="max-w-7xl mx-auto pt-12 border-t border-border/50">
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-8 rounded-lg bg-primary flex items-center justify-center"
            >
              <Icon name="ri:sparkling-2-fill" class="text-accent" size="14" />
            </div>
            <span class="font-black italic font-serif text-lg">Caphne</span>
            <span class="text-muted-foreground/30 px-2">|</span>
            <span
              class="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >Made in HCM City</span
            >
          </div>

          <div class="flex items-center gap-8">
            <a
              href="https://github.com/suka712/caphne-studybuddy"
              target="_blank"
              class="text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon name="ci:github" size="20" />
            </a>
            <p
              class="text-[11px] font-bold text-muted-foreground uppercase tracking-widest"
            >
              © {{ new Date().getFullYear() }} Caphne
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: "Cormorant Garamond", serif;
}

h1,
h2,
h3 {
  letter-spacing: -0.02em;
}

.glass {
  background: color-mix(in oklch, var(--background) 80%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
}
</style>
