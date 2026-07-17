export default defineNuxtRouteMiddleware(async () => {
  const { profile, fetchProfile } = useProfile();

  await fetchProfile();

  if (!profile.value) {
    return navigateTo("/start");
  }
});
