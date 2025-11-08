export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  taskCount?: number
  completedTaskCount?: number
}
