<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <Header />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <p class="text-sm text-gray-600 mt-1">Manage categories and system settings</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-500">Loading categories...</div>
      </div>

      <!-- Category Management -->
      <div v-else class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Management</h3>
        <p class="text-sm text-gray-600 mb-6">
          Manage task categories available across the application. Users can assign these categories to their tasks.
        </p>

        <div class="mb-6 space-y-3">
          <p class="text-sm text-gray-500">
            These quick actions demonstrate how to reuse the confirmation modal with different messages and button labels.
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="openRefreshConfirmation"
            >
              Refresh categories
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              @click="openMaintenanceConfirmation"
            >
              Run maintenance demo
            </button>
          </div>
          <p v-if="actionFeedback" class="text-xs text-gray-500">
            {{ actionFeedback }}
          </p>
        </div>

        <CategoryTable />
      </div>
    </main>

    <ConfirmationModal
      v-model="confirmationState.open"
      :message="confirmationState.message"
      :confirm-label="confirmationState.confirmLabel"
      cancel-label="Cancel"
      :loading="confirmationState.loading"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Header from '../components/Header.vue'
import CategoryTable from '../components/admin/CategoryTable.vue'
import { useTasksStore } from '../stores/tasks'
import ConfirmationModal from '../components/modals/ConfirmationModal.vue'

type ConfirmationAction = () => Promise<void> | void

const tasksStore = useTasksStore()
const loading = ref(false)
const actionFeedback = ref('')

const confirmationState = reactive({
  open: false,
  message: '',
  confirmLabel: 'Confirm',
  loading: false,
  action: null as ConfirmationAction | null,
})

const fetchCategories = async () => {
  loading.value = true
  try {
    await tasksStore.fetchCategories()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await fetchCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
})

const handleRefreshCategories = async () => {
  try {
    await fetchCategories()
    actionFeedback.value = 'Categories reloaded successfully.'
  } catch (error) {
    console.error('Failed to refresh categories:', error)
    actionFeedback.value = 'Unable to refresh categories right now.'
    throw error
  }
}

const runMaintenanceExample = async () => {
  await new Promise(resolve => setTimeout(resolve, 1200))
  actionFeedback.value = 'Maintenance demo completed.'
}

const openRefreshConfirmation = () => {
  confirmationState.message = 'Refreshing categories will pull the latest list from the server. Continue?'
  confirmationState.confirmLabel = 'Refresh categories'
  confirmationState.action = handleRefreshCategories
  confirmationState.open = true
}

const openMaintenanceConfirmation = () => {
  confirmationState.message = 'This example runs a mock maintenance script so you can see a different confirmation message.'
  confirmationState.confirmLabel = 'Run maintenance'
  confirmationState.action = runMaintenanceExample
  confirmationState.open = true
}

const handleModalConfirm = async () => {
  if (!confirmationState.action) {
    confirmationState.open = false
    return
  }

  confirmationState.loading = true
  try {
    await confirmationState.action()
  } catch (error) {
    console.error('Confirmation action failed:', error)
    if (!actionFeedback.value) {
      actionFeedback.value = 'Action failed. Please try again.'
    }
  } finally {
    confirmationState.loading = false
    confirmationState.open = false
  }
}
</script>
