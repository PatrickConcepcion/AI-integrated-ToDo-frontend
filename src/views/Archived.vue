<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <Header />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Archived Tasks</h2>
        <p class="text-sm text-gray-600 mt-1">Tasks that have been archived</p>
      </div>

      <!-- Loading State -->
      <div v-if="tasksStore.loading" class="text-center py-12">
        <div class="text-gray-500">Loading archived tasks...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="tasksStore.archivedTasks.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-gray-500">No archived tasks found.</p>
      </div>

      <!-- Archived Tasks List -->
      <div v-else class="space-y-3">
        <div
          v-for="task in tasksStore.archivedTasks"
          :key="task.id"
          class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow opacity-75"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-700">
                {{ task.title }}
              </h3>
              <p v-if="task.description" class="text-sm text-gray-600 mt-1">
                {{ task.description }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  v-if="task.category"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: task.category.color + '20', color: task.category.color }"
                >
                  {{ task.category.name }}
                </span>
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  ]"
                >
                  {{ task.priority }}
                </span>
                <span class="text-xs text-gray-500">
                  Archived: {{ new Date(task.updated_at).toLocaleDateString() }}
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="unarchiveTask(task.id)"
                class="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                title="Unarchive"
              >
                ↩️ Restore
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks'
import Header from '../components/Header.vue'

const tasksStore = useTasksStore()

// Loading states
const unarchivingTaskId = ref(null)

onMounted(async () => {
  await tasksStore.fetchArchivedTasks()
})

const unarchiveTask = async (taskId) => {
  if (unarchivingTaskId.value) return // Prevent concurrent operations

  unarchivingTaskId.value = taskId
  try {
    await tasksStore.unarchiveTask(taskId)
  } catch (error) {
    console.error('Failed to unarchive task:', error)
  } finally {
    unarchivingTaskId.value = null
  }
}
</script>
