<template>
  <div class="space-y-4">
    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Loading State -->
      <div v-if="authStore.loading && authStore.users.length === 0" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Loading users...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
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
            <!-- Empty State -->
            <tr v-if="authStore.users.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">
                No users found.
              </td>
            </tr>

            <!-- User Rows -->
            <tr v-for="user in authStore.users" :key="user.id" class="hover:bg-gray-50">
              <!-- Name -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.name }}
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="user.roles.includes('admin') ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ user.roles.includes('admin') ? 'Admin' : 'User' }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="user.is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                >
                  {{ user.is_banned ? 'Banned' : 'Active' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="!user.is_banned && !isCurrentUser(user.id)"
                  @click="handleBanUser(user.id, user.name)"
                  :disabled="actionLoading === user.id"
                  class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ actionLoading === user.id ? 'Banning...' : 'Ban' }}
                </button>
                <button
                  v-else-if="user.is_banned"
                  @click="handleUnbanUser(user.id, user.name)"
                  :disabled="actionLoading === user.id"
                  class="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ actionLoading === user.id ? 'Unbanning...' : 'Unban' }}
                </button>
                <span v-else class="text-gray-400 text-xs">
                  You
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      v-model="confirmationState.open"
      :action-title="confirmationState.actionTitle"
      :message="confirmationState.message"
      :confirm-label="confirmationState.confirmLabel"
      cancel-label="Cancel"
      :loading="confirmationState.loading"
      @confirm="confirmUserAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth'
import ConfirmationModal from '../modals/ConfirmationModal.vue'

const authStore = useAuthStore()
const actionLoading = ref<number | null>(null)

// Confirmation modal state
const confirmationState = reactive({
  open: false,
  actionTitle: '',
  message: '',
  confirmLabel: 'Confirm',
  loading: false,
})

// Track pending action
const pendingAction = ref<{ type: 'ban' | 'unban'; userId: number; userName: string } | null>(null)

// Check if user is the currently logged in user
const isCurrentUser = (userId: number): boolean => {
  return authStore.user?.id === userId
}

// Handle ban user
const handleBanUser = (userId: number, userName: string) => {
  pendingAction.value = { type: 'ban', userId, userName }
  confirmationState.actionTitle = 'Ban User'
  confirmationState.message = `Are you sure you want to ban "${userName}"? They will not be able to log in.`
  confirmationState.confirmLabel = 'Ban User'
  confirmationState.open = true
}

// Handle unban user
const handleUnbanUser = (userId: number, userName: string) => {
  pendingAction.value = { type: 'unban', userId, userName }
  confirmationState.actionTitle = 'Unban User'
  confirmationState.message = `Are you sure you want to unban "${userName}"?`
  confirmationState.confirmLabel = 'Unban User'
  confirmationState.open = true
}

// Confirm user action (ban or unban)
const confirmUserAction = async () => {
  if (!pendingAction.value) {
    confirmationState.open = false
    return
  }

  confirmationState.loading = true
  actionLoading.value = pendingAction.value.userId

  try {
    if (pendingAction.value.type === 'ban') {
      await authStore.banUser(pendingAction.value.userId)
    } else {
      await authStore.unbanUser(pendingAction.value.userId)
    }
  } catch (error) {
    console.error(`Failed to ${pendingAction.value.type} user:`, error)
  } finally {
    confirmationState.loading = false
    confirmationState.open = false
    actionLoading.value = null
    pendingAction.value = null
  }
}
</script>
