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
   * Send message to AI and get streaming response
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

    // Create placeholder for AI response
    const aiMsgId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    messages.value.push(aiMsg)

    // Helper to safely locate the AI message by ID (handles concurrent array mutations)
    const findAiMsg = () => messages.value.find(m => m.id === aiMsgId)

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
      }, {
        responseType: 'stream',
        adapter: 'fetch',
      })

      const reader = response.data.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              reader.cancel()
              break
            }

            try {
              const parsed = JSON.parse(data)
              const targetMsg = findAiMsg()
              
              if (parsed.chunk && targetMsg) {
                targetMsg.content += parsed.chunk
              } else if (parsed.error && targetMsg) {
                error.value = parsed.error
                targetMsg.content += `\n\nError: ${parsed.error}`
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message || 'Failed to get AI response'
        : 'Failed to get AI response'

      error.value = errorMessage
      const targetMsg = findAiMsg()
      if (targetMsg) {
        targetMsg.content = `Sorry, I encountered an error: ${errorMessage}`
      }

    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch conversation history from backend
   */
  const fetchMessages = async (): Promise<void> => {
    // Don't overwrite messages if user is already chatting (prevents race condition)
    if (messages.value.length > 0) {
      return
    }

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
