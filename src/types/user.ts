export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  email: string
  name: string
  roles: UserRole[]
  email_verified_at: string | null
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  taskCount?: number
  completedTaskCount?: number
}
