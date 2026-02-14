interface Profile {
  id: number
  displayName: string,
  gender: string,
  birthday: string,
  year: number,
  major: string,
  bio: string,
  photoUrl: string,
  isPublic: boolean,
  goals: string[],
  vibes: string[],
  interests: string[],
}

const profile = ref<Profile | null>(null)
const isCheckingProfile = ref(true)

export const useProfile = () => {
  const { public: { apiBase } } = useRuntimeConfig()

  const fetchProfile = async () => {
    try {
      const data = await $fetch<Profile>(`${apiBase}/profile`, {
        credentials: 'include',
      })
      profile.value = data
    } catch (e) {
      console.log('Failed to fetch profile:', e)
      profile.value = null
    } finally {
      isCheckingProfile.value = false
    }
  }

  const updateProfile = async (updates: any) => {
    const data = await $fetch<Profile>(`${apiBase}/profile`, {
      method: 'PUT',
      credentials: 'include',
      body: updates
    })
    profile.value = data
  }

  return {
    profile: readonly(profile),
    fetchProfile,
    isCheckingProfile,
    updateProfile
  }
}
