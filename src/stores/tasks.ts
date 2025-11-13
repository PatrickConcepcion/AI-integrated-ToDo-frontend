import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'
import type { Task, UpdateTaskInput } from '../types/task'
import { useToast } from '../composables/useToast'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const archivedTasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { success, error: toastError } = useToast()

  // Fetch tasks with optional filters
  const fetchTasks = async (filters: Record<string, unknown> = {}): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams(filters as Record<string, string>).toString()
      const response = await api.get(`/tasks${params ? `?${params}` : ''}`)
      tasks.value = response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to fetch tasks'
        : 'Failed to fetch tasks'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch archived tasks
  const fetchArchivedTasks = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/tasks/archived')
      archivedTasks.value = response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to fetch archived tasks'
        : 'Failed to fetch archived tasks'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create task
  const createTask = async (taskData: Record<string, unknown>): Promise<Task> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/tasks', taskData)
      success('Task created successfully!')
      return response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to create task'
        : 'Failed to create task'
      error.value = errorMessage
      toastError(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update task
  const updateTask = async (taskId: number, taskData: UpdateTaskInput): Promise<Task> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.put(`/tasks/${taskId}`, taskData)
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data.data
      }
      success('Task updated successfully!')
      return response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to update task'
        : 'Failed to update task'
      error.value = errorMessage
      toastError(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update only status
  const updateTaskStatus = async (taskId: number, status: string): Promise<Task> => {
    return await updateTask(taskId, { status })
  }

  // Delete task
  const deleteTask = async (taskId: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/tasks/${taskId}`)
      tasks.value = tasks.value.filter((t) => t.id !== taskId)
      success('Task deleted successfully!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to delete task'
        : 'Failed to delete task'
      error.value = errorMessage
      toastError(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle task completion
  const toggleComplete = async (taskId: number): Promise<Task> => {
    try {
      const response = await api.post(`/tasks/${taskId}/complete`)
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data.data
      }
      success('Task completion status updated!')
      return response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to toggle task completion'
        : 'Failed to toggle task completion'
      error.value = errorMessage
      toastError(errorMessage)
      throw err
    }
  }

  // Archive task
  const archiveTask = async (taskId: number): Promise<void> => {
    try {
      await api.post(`/tasks/${taskId}/archive`)
      tasks.value = tasks.value.filter((t) => t.id !== taskId)
      success('Task archived successfully!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to archive task'
        : 'Failed to archive task'
      error.value = errorMessage
      toastError(errorMessage)
      throw err
    }
  }

  // Unarchive task
  const unarchiveTask = async (taskId: number): Promise<Task> => {
    try {
      const response = await api.post(`/tasks/${taskId}/unarchive`)
      archivedTasks.value = archivedTasks.value.filter((t) => t.id !== taskId)
      success('Task unarchived successfully!')
      return response.data.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to unarchive task'
        : 'Failed to unarchive task'
      error.value = errorMessage
      toastError(errorMessage)
      throw err
    }
  }

  return {
    tasks,
    archivedTasks,
    loading,
    error,
    fetchTasks,
    fetchArchivedTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    toggleComplete,
    archiveTask,
    unarchiveTask,
  }
})
