import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['shadcn-nuxt', '@nuxt/icon'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins:[
      tailwindcss(),
    ]
  }
})