// .server.ts = exécuté uniquement pendant le rendu serveur.
// L'utilisateur est chargé AVANT le rendu, puis Pinia transmet l'état au client
// -> la page arrive déjà "connectée", sans flash.
// Les plugins passent avant les middlewares de route : le middleware auth voit donc l'utilisateur.
export default defineNuxtPlugin(async () => {
  const { loadUser } = useAuth()
  await loadUser()
})
