export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  email: string
  name: string
  roles: UserRole[]
  email_verified_at: string | null
  created_at: string
  updated_at: string
  is_banned: boolean

}

export interface UserProfile extends User {
  taskCount?: number
  completedTaskCount?: number
}
