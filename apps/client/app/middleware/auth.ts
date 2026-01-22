export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, isCheckingAuth, fetchUser } = useAuth()

  if (isCheckingAuth.value) {
    await fetchUser()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/')
  }
})