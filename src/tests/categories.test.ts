import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCategoriesStore } from '../stores/categories'
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

describe('Categories Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('should fetch categories', async () => {
        const store = useCategoriesStore()
        const mockCategories = [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' },
        ]
        vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategories } })
        await store.fetchCategories()
        expect(api.get).toHaveBeenCalledWith('/categories')
        expect(store.categories).toEqual(mockCategories)
        expect(store.categories.length).toBe(2)
        expect(store.categories).toContainEqual({ id: 1, name: 'Category 1' })
    })

    it('should not contain non-existent categories', async () => {
        const store = useCategoriesStore()
        const mockCategories = [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' },
        ]
        vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategories } })
        await store.fetchCategories()
        expect(store.categories).not.toContainEqual({ id: 3, name: 'Category 3' })
        expect(store.categories.length).not.toBe(3)
    })

    it('should create a category successfully', async () => {
        const store = useCategoriesStore()
        const newCategory = { name: 'New Category' }
        const createdCategory = { id: 3, ...newCategory }
        vi.mocked(api.post).mockResolvedValue({ data: { data: createdCategory } })
        const result = await store.createCategory(newCategory)
        expect(api.post).toHaveBeenCalledWith('/categories', newCategory)
        expect(result).toEqual(createdCategory)
        expect(store.categories).toContainEqual(createdCategory)
    })

    it('should update a category successfully', async () => {
        const store = useCategoriesStore()
        const mockCategories = [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' },
        ]
        vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategories } })
        await store.fetchCategories()

        const updatedData = { name: 'Updated Category 1' }
        const updatedCategory = { id: 1, ...updatedData }
        vi.mocked(api.put).mockResolvedValue({ data: { data: updatedCategory } })

        const result = await store.updateCategory(1, updatedData)
        expect(api.put).toHaveBeenCalledWith('/categories/1', updatedData)
        expect(result).toEqual(updatedCategory)
        expect(store.categories).toContainEqual(updatedCategory)
    })

    it('should delete a category successfully', async () => {
        const store = useCategoriesStore()
        const mockCategories = [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' },
        ]
        vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategories } })
        await store.fetchCategories()
        expect(store.categories.length).toBe(2)

        vi.mocked(api.delete).mockResolvedValue({})
        await store.deleteCategory(1)
        expect(api.delete).toHaveBeenCalledWith('/categories/1')
        expect(store.categories.length).toBe(1)
        expect(store.categories).not.toContainEqual({ id: 1, name: 'Category 1' })
    })

    it('should set loading state during fetch', async () => {
        const store = useCategoriesStore()
        const mockCategories = [{ id: 1, name: 'Category 1' }]
        vi.mocked(api.get).mockResolvedValue({ data: { data: mockCategories } })

        const fetchPromise = store.fetchCategories()
        expect(store.loading).toBe(true)

        await fetchPromise
        expect(store.loading).toBe(false)
    })

    it('should handle fetch error and set error state', async () => {
        const store = useCategoriesStore()
        const error = new Error('Network error')
        vi.mocked(api.get).mockRejectedValue(error)

        await expect(store.fetchCategories()).rejects.toThrow()

        expect(store.loading).toBe(false)
        expect(store.error).not.toBeNull()
    })

    it('should handle create error', async () => {
        const store = useCategoriesStore()
        const error = new Error('Failed to create')
        vi.mocked(api.post).mockRejectedValue(error)

        await expect(store.createCategory({ name: 'New Category' })).rejects.toThrow()

        expect(store.loading).toBe(false)
        expect(store.error).not.toBeNull()
    })

    it('should handle update error', async () => {
        const store = useCategoriesStore()
        const error = new Error('Failed to update')
        vi.mocked(api.put).mockRejectedValue(error)

        await expect(store.updateCategory(1, { name: 'Updated' })).rejects.toThrow()

        expect(store.loading).toBe(false)
        expect(store.error).not.toBeNull()
    })

    it('should handle delete error', async () => {
        const store = useCategoriesStore()
        const error = new Error('Failed to delete')
        vi.mocked(api.delete).mockRejectedValue(error)

        await expect(store.deleteCategory(1)).rejects.toThrow()

        expect(store.loading).toBe(false)
        expect(store.error).not.toBeNull()
    })
})