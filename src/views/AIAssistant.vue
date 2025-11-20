<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">AI Task Assistant</h1>
        <p class="mt-2 text-sm text-gray-600">
          Ask me anything about your tasks, or tell me to create, update, or delete tasks using natural language.
        </p>
      </div>

      <!-- Chat Container -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-16rem)]">
        <!-- Messages Area -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <!-- Welcome Message -->
          <div v-if="aiStore.messages.length === 0" class="text-center py-12">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">How can I help you today?</h3>
            <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              I can help you manage your tasks, answer questions, and perform actions on your behalf.
            </p>

            <!-- Suggested Prompts -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                v-for="prompt in suggestedPrompts"
                :key="prompt"
                @click="sendPrompt(prompt)"
                class="p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                {{ prompt }}
              </button>
            </div>
          </div>

          <!-- Chat Messages -->
          <div
            v-for="message in aiStore.messages"
            :key="message.id"
            :class="[
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-[80%] rounded-lg px-4 py-2',
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              ]"
            >
              <div
                v-if="message.role === 'assistant'"
                class="text-sm prose prose-sm max-w-none"
                v-html="renderMarkdown(message.content)"
              ></div>
              <div v-else class="text-sm whitespace-pre-wrap">{{ message.content }}</div>

              <!-- Action Results -->
              <div v-if="message.actionsPerformed" class="mt-2 space-y-1">
                <div
                  v-for="(action, idx) in message.actionsPerformed"
                  :key="idx"
                  :class="[
                    'text-xs px-2 py-1 rounded',
                    action.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ action.message }}
                </div>
              </div>

              <div
                :class="[
                  'text-xs mt-1',
                  message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                ]"
              >
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="aiStore.loading" class="flex justify-start">
            <div class="bg-gray-100 rounded-lg px-4 py-3">
              <div class="flex space-x-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 p-4">
          <form @submit.prevent="handleSubmit" class="flex gap-2">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="Type your message... (e.g., 'Create a task: Buy groceries tomorrow')"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
              :disabled="aiStore.loading"
            />
            <button
              type="submit"
              :disabled="!inputMessage.trim() || aiStore.loading"
              class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!aiStore.loading">Send</span>
              <span v-else>...</span>
            </button>
            <button
              v-if="aiStore.messages.length > 0"
              type="button"
              @click="handleClearChat"
              :disabled="aiStore.loading"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </form>
        </div>
      </div>

      <!-- Help Section -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Example Commands:</h4>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• "Create a task: Email client about project update"</li>
          <li>• "What should I focus on today?"</li>
          <li>• "Mark 'Deploy website' as completed"</li>
          <li>• "Delete the 'Old task' task"</li>
          <li>• "Show me my high priority tasks"</li>
        </ul>
      </div>

      <!-- Confirmation Modal -->
      <ConfirmationModal
        v-model="confirmationState.open"
        :action-title="confirmationState.actionTitle"
        :message="confirmationState.message"
        :confirm-label="confirmationState.confirmLabel"
        cancel-label="Cancel"
        :loading="confirmationState.loading"
        @confirm="confirmClearChat"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useAiStore } from '../stores/ai'
import { useTasksStore } from '../stores/tasks'
import { useToast } from '../composables/useToast'
import Header from '../components/Header.vue'
import ConfirmationModal from '../components/modals/ConfirmationModal.vue'
import { marked } from 'marked'

const aiStore = useAiStore()
const tasksStore = useTasksStore()
const { toastError } = useToast()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Confirmation modal state
const confirmationState = reactive({
  open: false,
  actionTitle: '',
  message: '',
  confirmLabel: 'Confirm',
  loading: false,
})

const suggestedPrompts = [
  'Who created you?',
  'What should I focus on today?',
  'Create a task: Review pull requests',
  'Show me my overdue tasks',
]

/**
 * Send a suggested prompt
 */
const sendPrompt = (prompt: string) => {
  inputMessage.value = prompt
  handleSubmit()
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  if (!inputMessage.value.trim() || aiStore.loading) return

  const message = inputMessage.value
  inputMessage.value = ''

  await aiStore.sendMessage(message)

  // Refresh tasks after AI response (in case tasks were modified)
  await tasksStore.fetchTasks()

  // Scroll to bottom
  scrollToBottom()
}

/**
 * Clear chat history (both frontend and backend)
 */
const handleClearChat = () => {
  confirmationState.actionTitle = 'Clear Chat History'
  confirmationState.message = 'Are you sure you want to clear the chat history? This will permanently delete all messages.'
  confirmationState.confirmLabel = 'Clear Chat'
  confirmationState.open = true
}

/**
 * Confirm clear chat
 */
const confirmClearChat = async () => {
  confirmationState.loading = true
  try {
    await aiStore.clearChat()
  } catch (error) {
    toastError('Failed to clear chat history. Please try again.')
    console.error('Error clearing chat:', error)
  } finally {
    confirmationState.loading = false
    confirmationState.open = false
  }
}

/**
 * Format timestamp for display
 */
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Render markdown content
 */
const renderMarkdown = (content: string): string => {
  return marked(content, { breaks: true }) as string
}

/**
 * Scroll to bottom of messages
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch for message changes and scroll to bottom
watch(
  () => aiStore.messages.length,
  () => {
    scrollToBottom()
  }
)

// Fetch tasks and message history on mount
onMounted(async () => {
  await Promise.all([
    tasksStore.fetchTasks(),
    aiStore.fetchMessages()
  ])
  // Scroll to bottom after mount to show latest messages
  scrollToBottom()
})
</script>
