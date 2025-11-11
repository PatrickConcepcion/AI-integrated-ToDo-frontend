export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  name: string
  description?: string
  completed: boolean
  userId: number
  createdAt: string
  updatedAt: string
  archivedAt?: string | null
  title?: string
  category_id?: number
  priority?: TaskPriority
  due_date?: string
  notes?: string
  status?: 'todo' | 'in_progress' | 'completed'
}

export interface CreateTaskInput {
  name: string
  description?: string
  title?: string
  category_id?: string
  priority?: TaskPriority
  due_date?: string
  notes?: string
}

export interface UpdateTaskInput {
  name?: string
  description?: string
  completed?: boolean
  title?: string
  category_id?: string
  priority?: TaskPriority
  due_date?: string
  notes?: string
  status?: string
}

export interface Category {
  id: number
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}
