import type { User } from './user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  password_confirmation?: string
}

export interface AuthResponse {
  access_token: string
  user?: User
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
}
