import { toast } from "vue-sonner"

interface AuthUser {
  id: number
  username: string
  email: string
}

const user = ref<AuthUser | null>(null)
const isCheckingAuth = ref(true)

export const useAuth = () => {
  const { public: { apiBase } } = useRuntimeConfig()
  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    try {
      const data = await $fetch<{ user: AuthUser }>(`${apiBase}/api/auth/me`, {
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
    window.location.href = `${apiBase}/api/auth/google`
  }

  const loginWithGitHub = () => {
    window.location.href = `${apiBase}/api/auth/github`
  }

  const updateProfile = async (profileData: { username: string }) => {
    try {
      const data = await $fetch<{ user: AuthUser }>(`${apiBase}/api/profile`, {
        method: 'PUT',
        body: profileData,
        credentials: 'include',
      })

      if (data.user) {
        user.value = data.user
      }
    } catch (error) {
      toast.error('Error updating profile')
    }
  }

  const logout = async () => {
    try {
      await $fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      user.value = null
    }
  }

  return {
    authUser: readonly(user),
    isCheckingAuth,
    isAuthenticated,
    fetchUser,
    updateProfile,
    logout,
    loginWithGoogle,
    loginWithGitHub,
  }
}
