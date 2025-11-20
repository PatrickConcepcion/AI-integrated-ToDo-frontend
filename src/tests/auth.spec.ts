import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

// Mock the API module
vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        }
    }
}))

// Mock useToast
vi.mock('../composables/useToast', () => ({
    useToast: () => ({
        success: vi.fn(),
        toastError: vi.fn()
    })
}))

describe('Auth Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
        localStorage.clear()
    })

    it('initializes with no user', () => {
        const auth = useAuthStore()
        expect(auth.user).toBeNull()
        expect(auth.token).toBeNull()
        expect(auth.isAuthenticated).toBe(false)
    })

    it('logs in successfully', async () => {
        const auth = useAuthStore()
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            roles: ['user'],
            email_verified_at: '2023-01-01T00:00:00.000000Z',
            is_banned: false,
            created_at: '2023-01-01T00:00:00.000000Z',
            updated_at: '2023-01-01T00:00:00.000000Z'
        }
        const mockToken = 'mock-token'

        // Mock login response
        vi.mocked(api.post).mockResolvedValueOnce({
            data: { access_token: mockToken }
        })

        // Mock fetchUser response
        vi.mocked(api.get).mockResolvedValueOnce({
            data: { data: mockUser }
        })

        const success = await auth.login({ email: 'test@example.com', password: 'password' })

        expect(success).toBe(true)
        expect(auth.token).toBe(mockToken)
        expect(auth.user).toEqual(mockUser)
        expect(auth.isAuthenticated).toBe(true)
        expect(localStorage.getItem('access_token')).toBe(mockToken)
    })

    it('handles login failure', async () => {
        const auth = useAuthStore()

        vi.mocked(api.post).mockRejectedValueOnce(new Error('Login failed'))

        const success = await auth.login({ email: 'test@example.com', password: 'wrong' })

        expect(success).toBe(false)
        expect(auth.token).toBeNull()
        expect(auth.user).toBeNull()
        expect(auth.error).toBeTruthy()
    })

    it('logs out successfully', async () => {
        const auth = useAuthStore()

        // Setup initial state
        auth.token = 'token'
        auth.user = {
            id: 1,
            email: 'test@example.com',
            name: 'Test',
            roles: [],
            email_verified_at: '2023-01-01T00:00:00.000000Z',
            is_banned: false,
            created_at: '2023-01-01T00:00:00.000000Z',
            updated_at: '2023-01-01T00:00:00.000000Z'
        }
        localStorage.setItem('access_token', 'token')

        vi.mocked(api.post).mockResolvedValueOnce({})

        await auth.logout()

        expect(auth.token).toBeNull()
        expect(auth.user).toBeNull()
        expect(localStorage.getItem('access_token')).toBeNull()
    })
})
