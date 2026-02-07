interface AuthUser {
  id: number
  email: string
}

const user = ref<AuthUser | null>(null)
const isCheckingAuth = ref(true)

export const useAuth = () => {
  const { public: { apiBase } } = useRuntimeConfig()
  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    try {
      const data = await $fetch<{ user: AuthUser }>(`${apiBase}/auth/me`, {
        credentials: 'include',
      })
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      isCheckingAuth.value = false
    }
  }

  const loginWithGoogle = () => {
    window.location.href = `${apiBase}/auth/google`
  }

  const loginWithGitHub = () => {
    window.location.href = `${apiBase}/auth/github`
  }

  const logout = async () => {
    try {
      await $fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      user.value = null
      const { disconnect } = useSocket()
      disconnect()
    }
  }

  return {
    authUser: readonly(user),
    isCheckingAuth,
    isAuthenticated,
    fetchUser,
    logout,
    loginWithGoogle,
    loginWithGitHub,
  }
}
