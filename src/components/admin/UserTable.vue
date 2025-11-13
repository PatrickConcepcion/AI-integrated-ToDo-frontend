<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Role
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <!-- Loading State -->
        <tr v-if="isLoadingUsers">
          <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
            <div class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading users...
            </div>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="authStore.users.length === 0">
          <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
            No users found.
          </td>
        </tr>

        <!-- User Rows -->
        <tr v-for="user in authStore.users" :key="user.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ user.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ user.email }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ user.roles?.join(', ') || 'user' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm" :class="user.is_banned ? 'text-red-600' : 'text-green-600'">
            {{ user.is_banned ? 'Banned' : 'Active' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button
              v-if="!user.is_banned"
              @click="handleBan(user.id, user.name)"
              :disabled="isBanning === user.id"
              class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isBanning === user.id ? 'Banning...' : 'Ban' }}
            </button>
            <button
              v-else
              @click="handleUnban(user.id, user.name)"
              :disabled="isUnbanning === user.id"
              class="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isUnbanning === user.id ? 'Unbanning...' : 'Unban' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'

const authStore = useAuthStore()
const { error: toastError } = useToast()
const isBanning = ref<number | null>(null)
const isUnbanning = ref<number | null>(null)
const isLoadingUsers = ref(false)

// Fetch users on mount
onMounted(async () => {
  isLoadingUsers.value = true
  try {
    await authStore.fetchUsers()
  } catch (error) {
    toastError('Failed to load users. Please try again.')
    console.error('Failed to fetch users:', error)
  } finally {
    isLoadingUsers.value = false
  }
})

// Ban user
const handleBan = async (userId: number, userName: string) => {
  if (!confirm(`Are you sure you want to ban "${userName}"?`)) {
    return
  }

  isBanning.value = userId
  try {
    await authStore.banUser(userId)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    toastError(`Failed to ban user "${userName}": ${errorMessage}`)
    console.error('Failed to ban user:', error)
  } finally {
    isBanning.value = null
  }
}

// Unban user
const handleUnban = async (userId: number, userName: string) => {
  if (!confirm(`Are you sure you want to unban "${userName}"?`)) {
    return
  }

  isUnbanning.value = userId
  try {
    await authStore.unbanUser(userId)
  } catch (error) {
    console.error('Failed to unban user:', error)
  } finally {
    isUnbanning.value = null
  }
}
</script>