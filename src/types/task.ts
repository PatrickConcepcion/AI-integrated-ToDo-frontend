import type { Category } from './category'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived'

export interface Task {
  id: number
  title: string
  description: string | null
  priority: TaskPriority | null
  status: TaskStatus
  previous_status: TaskStatus | null
  category_id: number | null
  category: Category | null
  due_date: string | null
  notes: string | null
  user_id: number
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  category_id?: number | null
  priority?: TaskPriority
  due_date?: string
  notes?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  category_id?: number | null
  priority?: TaskPriority
  due_date?: string
  notes?: string
  status?: TaskStatus
}
