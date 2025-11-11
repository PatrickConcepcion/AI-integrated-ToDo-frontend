import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import type { User, UserRole, LoginCredentials, RegisterData } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.roles?.includes('admin') ?? false)

  // Initialize from localStorage
  const initializeAuth = (): void => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      const parsedUser = JSON.parse(storedUser)

      // Migrate old role format to new roles array format
      if (parsedUser && 'role' in parsedUser && !('roles' in parsedUser)) {
        parsedUser.roles = parsedUser.role ? [parsedUser.role] : []
        delete parsedUser.role
        // Save migrated format back to localStorage
        localStorage.setItem('user', JSON.stringify(parsedUser))
      }

      user.value = parsedUser
    }
  }

  // Login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', credentials)
      const { access_token } = response.data

      token.value = access_token
      localStorage.setItem('access_token', access_token)

      // Fetch user profile
      await fetchUser()

      return true
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Login failed'
        : 'Login failed'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Register
  const register = async (userData: RegisterData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/register', userData)
      const { access_token } = response.data

      token.value = access_token
      localStorage.setItem('access_token', access_token)

      // Fetch user profile
      await fetchUser()

      return true
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Registration failed'
        : 'Registration failed'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch user profile
  const fetchUser = async (): Promise<void> => {
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (err) {
      console.error('Failed to fetch user:', err)
      throw err
    }
  }

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  }

  // Helper function to check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    return user.value?.roles?.includes(role) ?? false
  }

  // Initialize on store creation
  initializeAuth()

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    hasRole,
    login,
    register,
    fetchUser,
    logout,
  }
})
