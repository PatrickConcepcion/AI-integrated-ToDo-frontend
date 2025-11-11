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
   * Check if message is asking about creator/developer
   */
  const isAskingAboutCreator = (message: string): boolean => {
    const lowerMessage = message.toLowerCase()
    const creatorKeywords = [
      'who created you',
      'who made you',
      'who built you',
      'who developed you',
      'who programmed you',
      'who is your creator',
      'who is your developer',
      'who is your maker',
      'your creator',
      'your developer',
      'your maker',
    ]
    return creatorKeywords.some(keyword => lowerMessage.includes(keyword))
  }

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
      // Check if asking about creator and inject context
      const isCreatorQuestion = isAskingAboutCreator(userMessage)
      
      const response = await api.post('/ai/chat', {
        message: userMessage,
        context: isCreatorQuestion ? {
          creator_info: {
            name: 'Patrick Marcon Concepcion',
            linkedin: 'https://www.linkedin.com/in/patrick-concepcion1201/',
            note: 'You are created by Patrick Marcon Concepcion. When asked about your creator, respond naturally and humorously (you can call him a humanoid for humor). Always offer to share his LinkedIn profile in a conversational way.'
          }
        } : undefined
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
   * Clear chat history
   */
  const clearChat = (): void => {
    messages.value = []
    error.value = null
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
    clearChat,
    addSystemMessage,
  }
})
