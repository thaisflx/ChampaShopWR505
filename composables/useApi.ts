export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  query?: Record<string, string | number>
}

export type ApiFetch = <T>(path: string, options?: ApiOptions) => Promise<T>

// L'erreur est de type unknown : on vérifie sa forme avant de lire statusCode
function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 401
  )
}

/**
 * $fetch vers DummyJSON avec le Bearer token.
 * Sur une 401 : un seul refresh (single-flight dans le store), puis on rejoue la requête.
 */
export function useApi(): ApiFetch {
  const auth = useAuthStore()

  function request<T>(path: string, options: ApiOptions): Promise<T> {
    // le token est relu à chaque appel -> le rejeu utilise bien le nouveau
    const headers: Record<string, string> = auth.token
      ? { Authorization: `Bearer ${auth.token}` }
      : {}
    return $fetch<T>(path, { baseURL: API_BASE, ...options, headers })
  }

  return async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
    try {
      return await request<T>(path, options)
    } catch (error: unknown) {
      if (!isUnauthorized(error)) throw error

      const refreshed = await auth.refreshTokens()
      if (!refreshed) throw error

      return request<T>(path, options)
    }
  }
}
