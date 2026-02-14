interface Profile {
  id: number
  displayName: string
  gender: string
  birthday: string | null
  year: string
  major: string
  bio: string
  photoUrl: string | null
  isPublic: boolean
  goals: string[]
  vibes: string[]
  interests: string[]
}

const profile = ref<Profile | null>(null)
const isCheckingProfile = ref(true)

export const useProfile = () => {
  const { public: { apiBase } } = useRuntimeConfig()

  const fetchProfile = async () => {
    if (profile.value) {
      return
    }
    
    try {
      const data = await $fetch<Profile>(`${apiBase}/profile`, {
        credentials: 'include',
      })
      if (!data) {
        navigateTo('/start')
        return
      }
      profile.value = data
    } catch (e) {
      console.log('Failed to fetch profile:', e)
      navigateTo('/start')
    } finally {
      isCheckingProfile.value = false
    }
  }

  const createProfile = async (data: Omit<Profile, 'id'>) => {
    const created = await $fetch<Profile>(`${apiBase}/profile`, {
      method: 'POST',
      credentials: 'include',
      body: data
    })
    profile.value = created
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
    createProfile,
    isCheckingProfile,
    updateProfile
  }
}
