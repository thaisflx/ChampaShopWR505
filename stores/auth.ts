import type { AuthTokens, User } from '~/types/dummyjson'

export const useAuthStore = defineStore('auth', () => {
  const cookieOptions = {
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  } as const

  // Les cookies sont lisibles côté serveur ET côté client -> pas de "flash" au rechargement
  const accessToken = useCookie<string | null>('accessToken', {
    ...cookieOptions,
    maxAge: TOKEN_TTL_MINUTES * 60,
  })
  const refreshToken = useCookie<string | null>('refreshToken', {
    ...cookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })

  const user = ref<User | null>(null)

  // computed et pas les refs de cookie directement : sinon Pinia les sérialise
  // dans le payload et les réécrit à l'hydratation
  const token = computed<string | null>(() => accessToken.value ?? null)
  const hasSession = computed<boolean>(() => Boolean(refreshToken.value))
  const isLoggedIn = computed<boolean>(() => user.value !== null)

  function setTokens(tokens: AuthTokens): void {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
  }

  function setUser(value: User): void {
    user.value = value
  }

  function clear(): void {
    accessToken.value = null // null = cookie supprimé
    refreshToken.value = null
    user.value = null
  }

  // Un store est recréé à chaque requête côté serveur : le verrou single-flight
  // n'est donc jamais partagé entre deux visiteurs différents.
  const refreshTokens = createSingleFlight(async (): Promise<boolean> => {
    if (!refreshToken.value) return false
    try {
      const tokens = await $fetch<AuthTokens>('/auth/refresh', {
        baseURL: API_BASE,
        method: 'POST',
        body: {
          refreshToken: refreshToken.value,
          expiresInMins: TOKEN_TTL_MINUTES,
        },
      })
      setTokens(tokens)
      return true
    } catch {
      clear()
      return false
    }
  })

  return {
    user,
    token,
    hasSession,
    isLoggedIn,
    setTokens,
    setUser,
    clear,
    refreshTokens,
  }
})
