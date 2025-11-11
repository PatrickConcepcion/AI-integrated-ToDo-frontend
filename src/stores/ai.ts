import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

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

export const useAiStore = defineStore('ai', () => {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Send message to AI and get response
   */
  const sendMessage = async (userMessage: string): Promise<void> => {
    if (!userMessage.trim()) return

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    messages.value.push(userMsg)

    loading.value = true
    error.value = null

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
      })

      // Add AI response to chat
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        actionsPerformed: response.data.actions_performed || undefined,
      }
      messages.value.push(aiMsg)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to get AI response'
        : 'Failed to get AI response'

      error.value = errorMessage

      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      }
      messages.value.push(errorMsg)

    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch conversation history from backend
   */
  const fetchMessages = async (): Promise<void> => {
    try {
      const response = await api.get('/ai/messages')

      if (response.data.success && response.data.messages) {
        // Transform backend messages to ChatMessage format
        messages.value = response.data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.is_ai_response ? 'assistant' : 'user',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }))
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to load message history'
        : 'Failed to load message history'

      error.value = errorMessage
      console.error('Failed to fetch messages:', err)
    }
  }

  /**
   * Clear chat history (both frontend and backend)
   */
  const clearChat = async (): Promise<void> => {
    try {
      // Clear conversation on backend (hard delete)
      await api.delete('/ai/conversations')

      // Clear local messages
      messages.value = []
      error.value = null
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to clear conversation'
        : 'Failed to clear conversation'

      error.value = errorMessage
      console.error('Failed to clear conversation:', err)
    }
  }

  /**
   * Add a system message (for UI feedback)
   */
  const addSystemMessage = (content: string): void => {
    const systemMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }
    messages.value.push(systemMsg)
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
    clearChat,
    addSystemMessage,
  }
})
