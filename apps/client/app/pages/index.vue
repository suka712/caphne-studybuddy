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
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-primary text-[11px] font-black uppercase tracking-[0.2em]"
            >
              <Icon name="lucide:map-pin" size="12" class="text-accent" />
              Ho Chi Minh City
            </span>
          </div>

          <h1
            class="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-primary animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100"
          >
            Where <span class="text-accent">ambition</span><br />
            meets <span class="text-accent">matcha</span>.
          </h1>

          <p
            class="text-xl font-medium text-muted-foreground leading-relaxed max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200"
          >
            A studybuddy app for students in Saigon. Cram for midterms, crack
            problem sets, and survive group projects together.
          </p>

          <button
            class="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 hover:opacity-80 transition-opacity cursor-pointer group/social"
            @click="loginWithGoogle"
          >
            <div class="flex -space-x-3">
              <div
                v-for="i in 3"
                :key="i"
                class="size-9 rounded-full border-2 border-background overflow-hidden bg-secondary transition-transform group-hover/social:scale-110"
              >
                <img
                  :src="`/placeholder-${i}.png`"
                  alt=""
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            <p class="text-sm font-bold text-muted-foreground text-left">
              <span
                class="text-primary underline decoration-accent/30 decoration-2 underline-offset-4"
                >300+ students</span
              >
              already matched
            </p>
          </button>
        </div>

        <!-- The App Hero Card -->
        <div
          class="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-1000 delay-300"
        >
          <div
            class="w-full max-w-sm p-8 relative overflow-hidden bg-card border shadow-sm rounded-xl"
          >
            <div
              class="absolute -top-10 -right-10 size-32 bg-accent/20 blur-3xl rounded-full"
            />

            <div class="flex items-center gap-3 mb-8">
              <div
                class="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <Icon
                  name="ri:sparkling-2-fill"
                  class="text-accent"
                  size="18"
                />
              </div>
              <span class="font-black text-xl tracking-tighter">caphne.</span>
            </div>

            <h2 class="text-3xl font-black leading-tight mb-3">
              Find your<br />
              <span class="text-accent">studybuddy</span>.
            </h2>
            <p
              class="text-sm font-medium text-muted-foreground leading-relaxed mb-8"
            >
              Sign in to start matching with students near you based on your
              major and goals.
            </p>

            <div v-if="!isAuthenticated" class="space-y-3">
              <Button
                size="lg"
                class="w-full h-14 rounded-2xl font-black gap-2 shadow-xl shadow-primary/10 hover:scale-[1.02] transition-transform active:scale-95"
                @click="loginWithGoogle"
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
                  variant="outline"
                  class="h-12 rounded-xl text-xs font-black gap-2 border-primary/10 hover:bg-primary/5"
                  @click="loginWithGoogle"
                >
                  <Icon name="ci:google" size="14" /> Google
                </Button>
                <Button
                  variant="outline"
                  class="h-12 rounded-xl text-xs font-black gap-2 border-primary/10 hover:bg-primary/5"
                  @click="loginWithGitHub"
                >
                  <Icon name="ci:github" size="14" /> GitHub
                </Button>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                <p class="text-sm font-black text-primary">Welcome back!</p>
                <p class="text-xs font-bold text-muted-foreground">
                  You have new matches waiting.
                </p>
              </div>
              <NuxtLink to="/profile">
                <Button
                  class="w-full h-14 rounded-2xl font-black hover:scale-[1.02] transition-transform"
                  >Go to Profile</Button
                >
              </NuxtLink>
            </div>

            <div
              class="mt-8 pt-6 border-t border-dashed border-primary/10 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground/50"
            >
              <span>Free to join</span>
              <span class="flex items-center gap-1.5">
                <Icon
                  name="lucide:shield-check"
                  size="12"
                  class="text-accent"
                />
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
            class="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-background"
          >
            <img src="/placeholder-4.png" class="w-full h-full object-cover" />
          </div>
          <div
            class="absolute -bottom-8 -right-8 w-1/2 aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-background"
          >
            <img src="/placeholder-2.png" class="w-full h-full object-cover" />
          </div>
        </div>

        <div class="order-1 md:order-2">
          <h2 class="text-5xl md:text-6xl font-black leading-[1.05] mb-8">
            Better with<br />
            <span class="text-accent">someone</span> there.
          </h2>
          <p
            class="text-lg font-medium text-muted-foreground leading-relaxed mb-10 max-w-md"
          >
            Caphne is for the late library nights, the assignments due tomorrow,
            and the cafes that stay open past midnight. Don't study alone when
            you don't have to.
          </p>
          <Button
            size="lg"
            class="h-14 px-8 rounded-2xl font-black gap-2 shadow-xl shadow-primary/5 hover:scale-105 transition-transform"
            @click="loginWithGoogle"
          >
            Find a studybuddy
            <Icon name="lucide:arrow-right" size="16" />
          </Button>
        </div>
      </div>
    </section>

    <!-- ── PAIRS ────────────────────────────────────────────── -->
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
        <div
          class="group flex flex-col p-8 rounded-[3rem] bg-secondary/30 border border-primary/5 hover:bg-secondary/50 transition-colors duration-500"
        >
          <div
            class="aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 border-4 border-background shadow-xl"
          >
            <img
              src="/placeholder-1.png"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <span
            class="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-3"
          >
            <Icon name="lucide:code" size="13" />
            Builder Friend Forever
          </span>
          <h3 class="text-3xl font-black mb-4">
            Find your <span class="text-accent">BFF</span>.
          </h3>
          <p
            class="text-muted-foreground font-medium leading-relaxed mb-8 max-w-md"
          >
            For side projects, hackathons, and the weekends you'd otherwise
            spend debugging alone. Match with developers and designers.
          </p>
          <div class="mt-auto">
            <Button
              variant="outline"
              class="h-12 rounded-xl font-black px-6 border-primary/10 bg-background/50 group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              @click="loginWithGoogle"
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
        <div
          class="group flex flex-col p-8 rounded-[3rem] bg-secondary/30 border border-primary/5 hover:bg-secondary/50 transition-colors duration-500"
        >
          <div
            class="aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8 border-4 border-background shadow-xl"
          >
            <img
              src="/placeholder-3.png"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <span
            class="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-3"
          >
            <Icon name="lucide:coffee" size="13" />
            Coffee Date
          </span>
          <h3 class="text-3xl font-black mb-4">
            Or just a <span class="text-accent">coffee date</span>.
          </h3>
          <p
            class="text-muted-foreground font-medium leading-relaxed mb-8 max-w-md"
          >
            Sometimes a study session is really just an excuse for cà phê. Find
            someone to share a table with at your favorite local spot.
          </p>
          <div class="mt-auto">
            <Button
              variant="outline"
              class="h-12 rounded-xl font-black px-6 border-primary/10 bg-background/50 group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              @click="loginWithGoogle"
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
        class="relative overflow-hidden rounded-[3.5rem] bg-secondary/30 p-12 md:p-20 text-center border border-primary/5"
      >
        <div class="absolute inset-0 bg-accent/5 blur-3xl rounded-full" />

        <div class="relative z-10 max-w-xl mx-auto">
          <span
            class="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6"
          >
            <Icon name="lucide:mail" size="13" />
            Newsletter
          </span>
          <h2
            class="text-4xl md:text-5xl font-black text-primary mb-6 leading-tight"
          >
            Updates, when they
            <span class="text-accent underline decoration-4 underline-offset-8"
              >matter</span
            >.
          </h2>
          <p class="text-muted-foreground font-bold mb-10">
            New features and study meetups around Saigon. No spam, just the good
            stuff.
          </p>

          <form class="space-y-3" @submit.prevent="submitEmail">
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                class="flex-1 h-14 px-6 rounded-2xl bg-background border border-primary/10 text-primary placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-accent/40 outline-none transition-all font-bold"
              />
              <Button
                type="submit"
                :disabled="isSubmitting"
                class="h-14 px-8 rounded-2xl font-black bg-primary text-primary-foreground hover:scale-105 transition-all"
              >
                {{ isSubmitting ? "..." : "Keep me posted" }}
              </Button>
            </div>
            <p
              v-if="message"
              class="text-sm font-black mt-4"
              :class="isError ? 'text-destructive' : 'text-accent'"
            >
              {{ message }}
            </p>
          </form>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ───────────────────────────────────────────── -->
    <footer class="pb-20 px-4">
      <div class="max-w-7xl mx-auto pt-12 border-t border-primary/5">
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-8 rounded-lg bg-primary flex items-center justify-center"
            >
              <Icon name="ri:sparkling-2-fill" class="text-accent" size="14" />
            </div>
            <span class="font-black text-xl tracking-tighter">caphne.</span>
            <span class="text-muted-foreground/30 px-2">|</span>
            <span
              class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]"
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
              class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]"
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
h1,
h2,
h3 {
  letter-spacing: -0.04em;
}
</style>
