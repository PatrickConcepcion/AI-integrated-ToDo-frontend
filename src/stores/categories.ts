import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'
import type { Category } from '../types'
import { useToast } from '../composables/useToast'
import { handleApiError } from '../utils/apiErrorHandling'

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
      handleApiError(err, error, toastError, 'Failed to fetch categories')
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
      handleApiError(err, error, toastError, 'Failed to create category')
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
      handleApiError(err, error, toastError, 'Failed to update category')
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
      handleApiError(err, error, toastError, 'Failed to delete category')
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
