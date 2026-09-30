export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (!auth.isLoggedIn) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
})
