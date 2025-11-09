<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <Header :show-mobile-menu="false" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">AI Chat Assistant</h2>
        <p class="text-sm text-gray-600 mt-1">Ask questions about tasks and get AI-powered insights</p>
      </div>

      <!-- AI Chat Interface Placeholder -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Messages Area -->
        <div class="h-96 p-6 overflow-y-auto bg-gray-50">
          <div class="space-y-4">
            <!-- Example message -->
            <div class="flex justify-start">
              <div class="bg-white px-4 py-2 rounded-lg shadow max-w-md">
                <p class="text-sm text-gray-800">
                  Hello! I'm your AI assistant. Ask me anything about tasks, users, or productivity insights.
                </p>
                <p class="text-xs text-gray-500 mt-1">Example: "How long did user 1 take to finish all tasks?"</p>
              </div>
            </div>

            <!-- Placeholder for future messages -->
            <div class="text-center py-8">
              <div class="inline-block p-4 bg-indigo-50 rounded-lg">
                <p class="text-sm text-indigo-600 font-medium">🤖 AI Integration Coming Soon!</p>
                <p class="text-xs text-gray-600 mt-1">
                  This is where you'll implement OpenAI chat functionality
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 p-4 bg-white">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="message"
              type="text"
              placeholder="Ask me about tasks, users, or productivity..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled
            />
            <button
              type="submit"
              disabled
              class="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Send
            </button>
          </form>
          <p class="text-xs text-gray-500 mt-2">
            💡 Tip: You'll integrate OpenAI API here to query task data and generate insights
          </p>
        </div>
      </div>

      <!-- Example Queries -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Example AI Queries</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">"How many tasks did user 1 complete this week?"</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">"Show me overdue high-priority tasks"</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">"Which category has the most incomplete tasks?"</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">"Summarize user productivity for the past month"</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue'

const message = ref('')

const sendMessage = () => {
  // TODO: Implement AI chat integration
  console.log('Send message:', message.value)
}
</script>
