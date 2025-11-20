import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '../stores/tasks'
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

describe('Tasks Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('fetches tasks successfully', async () => {
        const store = useTasksStore()
        const mockTasks = [
            { 
                id: 1, 
                name: 'Task 1',
                title: 'Task 1', 
                status: 'todo' as const,
                completed: false,
                userId: 1,
                createdAt: '2025-11-20T00:00:00Z',
                updatedAt: '2025-11-20T00:00:00Z'
            },
            { 
                id: 2, 
                name: 'Task 2',
                title: 'Task 2', 
                status: 'completed' as const,
                completed: true,
                userId: 1,
                createdAt: '2025-11-20T00:00:00Z',
                updatedAt: '2025-11-20T00:00:00Z'
            }
        ]

        vi.mocked(api.get).mockResolvedValueOnce({
            data: { data: mockTasks }
        })

        await store.fetchTasks()

        expect(store.tasks).toEqual(mockTasks)
        expect(store.loading).toBe(false)
    })

    it('creates a task successfully', async () => {
        const store = useTasksStore()
        const newTask = { title: 'New Task' }
        const createdTask = { 
            id: 3, 
            name: 'New Task',
            ...newTask, 
            status: 'todo' as const,
            completed: false,
            userId: 1,
            createdAt: '2025-11-20T00:00:00Z',
            updatedAt: '2025-11-20T00:00:00Z'
        }

        vi.mocked(api.post).mockResolvedValueOnce({
            data: { data: createdTask }
        })

        const result = await store.createTask(newTask)

        expect(result).toEqual(createdTask)
    })

    it('updates a task successfully', async () => {
        const store = useTasksStore()
        const initialTask = { 
            id: 1, 
            name: 'Task 1',
            title: 'Task 1', 
            status: 'todo' as const,
            completed: false,
            userId: 1,
            createdAt: '2025-11-20T00:00:00Z',
            updatedAt: '2025-11-20T00:00:00Z'
        }
        store.tasks = [initialTask]

        const updatedTask = { ...initialTask, status: 'completed' as const, completed: true }

        vi.mocked(api.put).mockResolvedValueOnce({
            data: { data: updatedTask }
        })

        const result = await store.updateTask(1, { status: 'completed' })

        expect(result).toEqual(updatedTask)
        expect(store.tasks[0]).toEqual(updatedTask)
    })

    it('deletes a task successfully', async () => {
        const store = useTasksStore()
        const taskToDelete = { 
            id: 1, 
            name: 'Task 1',
            title: 'Task 1',
            completed: false,
            userId: 1,
            createdAt: '2025-11-20T00:00:00Z',
            updatedAt: '2025-11-20T00:00:00Z'
        }
        store.tasks = [taskToDelete]

        vi.mocked(api.delete).mockResolvedValueOnce({})

        await store.deleteTask(1)

        expect(store.tasks).toHaveLength(0)
    })
})
