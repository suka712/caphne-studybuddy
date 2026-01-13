import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useScrollNavbar = () => {
  const state = reactive({
    showNavbar: false,
    lastScrollY: 0
  })

  const handleScroll = () => {
    const currentScrollY = window.scrollY
    
    if (currentScrollY < 200) {
      state.showNavbar = false
    } else if (currentScrollY > state.lastScrollY) {
      state.showNavbar = true
    } else {
      state.showNavbar = true
    }
    
    state.lastScrollY = currentScrollY
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return toRefs(state)
}
