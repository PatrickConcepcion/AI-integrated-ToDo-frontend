import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'
import type { Category } from '../types'
import { useToast } from '../composables/useToast'

export const useCategoriesStore = defineStore('categories', () => {
  const { toastError } = useToast()

  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch categories
  const fetchCategories = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/categories')
      categories.value = response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to fetch categories'
        : 'Failed to fetch categories'
      toastError(errorMessage)
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create category
  const createCategory = async (categoryData: Record<string, unknown>): Promise<Category> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/categories', categoryData)
      categories.value.push(response.data.data)
      return response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to create category'
        : 'Failed to create category'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update category
  const updateCategory = async (categoryId: number, categoryData: Record<string, unknown>): Promise<Category> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.put(`/categories/${categoryId}`, categoryData)
      const index = categories.value.findIndex((c) => c.id === categoryId)
      if (index !== -1) {
        categories.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to update category'
        : 'Failed to update category'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete category
  const deleteCategory = async (categoryId: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/categories/${categoryId}`)
      categories.value = categories.value.filter((c) => c.id !== categoryId)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to delete category'
        : 'Failed to delete category'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
