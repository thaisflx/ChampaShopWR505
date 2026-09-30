import type { LoginResponse, User } from '~/types/dummyjson'

export interface UseAuth {
  login: (username: string, password: string) => Promise<void>
  loadUser: () => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuth {
  const auth = useAuthStore()
  const api = useApi()

  async function loadUser(): Promise<void> {
    if (!auth.hasSession) return
    try {
      auth.setUser(await api<User>('/auth/me'))
    } catch {
      auth.clear() // tokens invalides et refresh impossible
    }
  }

  async function login(username: string, password: string): Promise<void> {
    const response = await $fetch<LoginResponse>('/auth/login', {
      baseURL: API_BASE,
      method: 'POST',
      body: { username, password, expiresInMins: TOKEN_TTL_MINUTES },
    })
    auth.setTokens(response)
    await loadUser()
  }

  async function logout(): Promise<void> {
    auth.clear()
    await navigateTo('/')
  }

  return { login, loadUser, logout }
}
