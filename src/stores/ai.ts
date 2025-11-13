import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'
import { useToast } from '../composables/useToast'
import type { ChatMessage, BackendMessage } from '../types/ai'

export const useAiStore = defineStore('ai', () => {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { success, error: toastError } = useToast()

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
      toastError(errorMessage)

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
    loading.value = true
    try {
      const response = await api.get('/ai/messages')

      if (response.data.success && response.data.messages) {
        // Clear any previous errors on successful response
        error.value = null

        // Transform backend messages to ChatMessage format
        messages.value = response.data.messages.map((msg: BackendMessage) => ({
          id: msg.id.toString(),
          role: msg.is_ai_response ? 'assistant' : 'user',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }))
      } else {
        // Handle unsuccessful response
        const errorMessage = 'Failed to load message history: Invalid response format'
        error.value = errorMessage
        messages.value = []
        console.error('Failed to fetch messages - invalid response:', response)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to load message history'
        : 'Failed to load message history'

      error.value = errorMessage
      console.error('Failed to fetch messages:', err)
    } finally {
      loading.value = false
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
      success('Chat history cleared successfully!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? (err as any).response?.data?.message || 'Failed to clear conversation'
        : 'Failed to clear conversation'

      error.value = errorMessage
      toastError(errorMessage)
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
    fetchMessages,
    sendMessage,
    clearChat,
    addSystemMessage,
  }
})
