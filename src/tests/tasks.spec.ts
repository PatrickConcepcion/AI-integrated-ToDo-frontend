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
                title: 'Task 1', 
                description: null,
                priority: null,
                status: 'todo' as const,
                previous_status: null,
                category_id: null,
                category: null,
                due_date: null,
                notes: null,
                user_id: 1,
                created_at: '2025-11-20T00:00:00Z',
                updated_at: '2025-11-20T00:00:00Z'
            },
            { 
                id: 2, 
                title: 'Task 2', 
                description: null,
                priority: null,
                status: 'completed' as const,
                previous_status: null,
                category_id: null,
                category: null,
                due_date: null,
                notes: null,
                user_id: 1,
                created_at: '2025-11-20T00:00:00Z',
                updated_at: '2025-11-20T00:00:00Z'
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
            ...newTask,
            description: null,
            priority: null,
            status: 'todo' as const,
            previous_status: null,
            category_id: null,
            category: null,
            due_date: null,
            notes: null,
            user_id: 1,
            created_at: '2025-11-20T00:00:00Z',
            updated_at: '2025-11-20T00:00:00Z'
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
            title: 'Task 1', 
            description: null,
            priority: null,
            status: 'todo' as const,
            previous_status: null,
            category_id: null,
            category: null,
            due_date: null,
            notes: null,
            user_id: 1,
            created_at: '2025-11-20T00:00:00Z',
            updated_at: '2025-11-20T00:00:00Z'
        }
        store.tasks = [initialTask]

        const updatedTask = { ...initialTask, status: 'completed' as const }

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
            title: 'Task 1',
            description: null,
            priority: null,
            status: 'todo' as const,
            previous_status: null,
            category_id: null,
            category: null,
            due_date: null,
            notes: null,
            user_id: 1,
            created_at: '2025-11-20T00:00:00Z',
            updated_at: '2025-11-20T00:00:00Z'
        }
        store.tasks = [taskToDelete]

        vi.mocked(api.delete).mockResolvedValueOnce({})

        await store.deleteTask(1)

        expect(store.tasks).toHaveLength(0)
    })
})
