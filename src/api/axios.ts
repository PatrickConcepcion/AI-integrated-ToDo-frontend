import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface ErrorResponse {
  message?: string
  exception?: string
}

// Request interceptor - attach token to every request
api.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig
    const errorData = error.response?.data as ErrorResponse

    // Check if this is an authentication error
    // 401: Token expired/invalid
    // 500 with "Unauthenticated.": Backend threw auth exception with wrong status code
    const isAuthError =
      error.response?.status === 401 ||
      (error.response?.status === 500 && errorData?.message === 'Unauthenticated.')

    // If token is expired and we haven't tried refreshing yet
    if (isAuthError && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const token = localStorage.getItem('access_token')
        if (token) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          const newToken = response.data.access_token

          // Save new token
          localStorage.setItem('access_token', newToken)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
