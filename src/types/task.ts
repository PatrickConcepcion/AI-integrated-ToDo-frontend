export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived'

export interface Task {
  id: number
  title: string
  description?: string | null
  priority?: TaskPriority | null
  status: TaskStatus
  previous_status?: TaskStatus | null
  category_id?: number | null
  category?: Category | null
  due_date?: string | null
  notes?: string | null
  user_id?: number
  userId?: number
  created_at?: string
  updated_at?: string
  // Legacy/camelCase properties preserved for compatibility with older code
  name?: string
  completed?: boolean
  createdAt?: string
  updatedAt?: string
  archivedAt?: string | null
}

export interface CreateTaskInput {
  name?: string
  description?: string
  title?: string
  category_id?: string | number
  priority?: TaskPriority
  due_date?: string
  notes?: string
}

export interface UpdateTaskInput {
  name?: string
  description?: string
  completed?: boolean
  title?: string
  category_id?: string | number
  priority?: TaskPriority
  due_date?: string
  notes?: string
  status?: TaskStatus
}

export interface Category {
  id: number
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}
