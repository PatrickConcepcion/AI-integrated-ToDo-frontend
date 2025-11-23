import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'
import type { Task, UpdateTaskInput, TaskStatus } from '../types'
import { useApiError } from '../composables/useApiError'
import { useToast } from '../composables/useToast'

export const useTasksStore = defineStore('tasks', () => {
  const { handleApiError } = useApiError()
  const { success } = useToast()

  const tasks = ref<Task[]>([])
  const archivedTasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch tasks with optional filters
  const fetchTasks = async (filters: Record<string, unknown> = {}): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams(filters as Record<string, string>).toString()
      const response = await api.get(`/tasks${params ? `?${params}` : ''}`)
      tasks.value = response.data.data
    } catch (err: unknown) {
      console.error('Failed to fetch tasks:', err)
      handleApiError(err, error, 'Failed to fetch tasks')
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
      console.error('Failed to fetch archived tasks:', err)
      handleApiError(err, error, 'Failed to fetch archived tasks')
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
      return response.data.data
    } catch (err: unknown) {
      console.error('Failed to create task:', err)
      handleApiError(err, error, 'Failed to create task')
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
      const updatedTask = response.data.data as Task
      const index = tasks.value.findIndex((t) => t.id === taskId)

      if (updatedTask.status === 'archived') {
        tasks.value = tasks.value.filter((t) => t.id !== taskId)
        archivedTasks.value = [...archivedTasks.value.filter((t) => t.id !== taskId), updatedTask]
      } else {
        if (index !== -1) {
          tasks.value[index] = updatedTask
        } else {
          tasks.value.push(updatedTask)
        }
        archivedTasks.value = archivedTasks.value.filter((t) => t.id !== taskId)
      }

      return updatedTask
    } catch (err: unknown) {
      console.error('Failed to update task:', err)
      handleApiError(err, error, 'Failed to update task')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update only status
  const updateTaskStatus = async (taskId: number, status: TaskStatus): Promise<Task> => {
    return await updateTask(taskId, { status })
  }

  // Delete task
  const deleteTask = async (taskId: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/tasks/${taskId}`)
      tasks.value = tasks.value.filter((t) => t.id !== taskId)
    } catch (err: unknown) {
      console.error('Failed to delete task:', err)
      handleApiError(err, error, 'Failed to delete task')
    } finally {
      loading.value = false
    }
  }

  // Toggle task completion
  const toggleComplete = async (taskId: number): Promise<Task> => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) {
      throw new Error('Task not found in active tasks')
    }
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed'

    try {
      const updated = await updateTask(taskId, { status: nextStatus })
      return updated
    } catch (err: unknown) {
      console.error('Failed to toggle task completion:', err)
      handleApiError(err, error, 'Failed to toggle task completion')
      throw err
    }
  }

  // Archive task
  const archiveTask = async (taskId: number): Promise<void> => {
    try {
      await updateTask(taskId, { status: 'archived' })
      success('Task archived successfully.')
    } catch (err: unknown) {
      console.error('Failed to archive task:', err)
      handleApiError(err, error, 'Failed to archive task')
    }
  }

  // Unarchive task
  const unarchiveTask = async (taskId: number): Promise<Task> => {
    const archivedTask = archivedTasks.value.find((t) => t.id === taskId)
    const targetStatus: TaskStatus = archivedTask?.previous_status || 'todo'

    try {
      const restoredTask = await updateTask(taskId, { status: targetStatus })
      success('Task restored successfully.')
      return restoredTask
    } catch (err: unknown) {
      console.error('Failed to unarchive task:', err)
      handleApiError(err, error, 'Failed to unarchive task')
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
