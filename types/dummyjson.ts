export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

// POST /auth/login renvoie l'utilisateur + les deux tokens
export interface LoginResponse extends User, AuthTokens {}
