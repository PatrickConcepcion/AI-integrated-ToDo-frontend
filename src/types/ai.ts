export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actionsPerformed?: Array<{
    success: boolean
    action?: string
    task_id?: number
    message: string
  }>
}

export interface BackendMessage {
  id: number
  is_ai_response: boolean
  content: string
  created_at: string
}