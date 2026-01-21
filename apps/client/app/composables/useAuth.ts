interface AuthUser {
  id: number
  username: string
  email: string
}

const user = ref<AuthUser | null>(null)

export function useAuth() {
  const { public: { apiBase } } = useRuntimeConfig()
  const isAuthenticated = computed(() => !!user.value)

  async function fetchUser() {
    try {
      const data = await $fetch<{ user: AuthUser }>(`${apiBase}/api/auth/me`, {
        credentials: 'include',
      })
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  async function updateProfile(profileData: {username: string}) {
    try {
      const data = await $fetch<{ user: AuthUser }>(`${apiBase}/api/profile/update`, {
        method: 'PUT',
        body: profileData,
        credentials: 'include',
      })

      if (data.user) {
        user.value = { ...user.value, ...data.user}
      }

      return data
    } catch (error) {
      console.error('Failed to update profile', error)
      throw error
    }
  }

  async function logout() {
    try {
      await $fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      user.value = null
    }
  }

  function loginWithGoogle() {
    window.location.href = `${apiBase}/api/auth/google`
  }

  function loginWithGitHub() {
    window.location.href = `${apiBase}/api/auth/github`
  }

  return {
    user: readonly(user),
    isAuthenticated,
    fetchUser,
    updateProfile,
    logout,
    loginWithGoogle,
    loginWithGitHub,
  }
}