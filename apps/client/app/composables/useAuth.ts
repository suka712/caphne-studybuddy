interface AuthUser {
  id: number
  username: string
  email: string
}

const user = ref<AuthUser | null>(null)

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
    }
  }

  const updateProfile = async (profileData: { username: string }) => {
    try {
      const data = await $fetch<{ user: AuthUser }>(`${apiBase}/api/profile/update`, {
        method: 'PUT',
        body: profileData,
        credentials: 'include',
      })

      if (data.user) {
        user.value = data.user
      }

    } catch (error) {
      console.error('Failed to update profile', error)
      throw error
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

  const loginWithGoogle = () => {
    window.location.href = `${apiBase}/api/auth/google`
  }

  const loginWithGitHub = () => {
    window.location.href = `${apiBase}/api/auth/github`
  }

  return {
    authUser: readonly(user),
    isAuthenticated,
    fetchUser,
    updateProfile,
    logout,
    loginWithGoogle,
    loginWithGitHub,
  }
}
