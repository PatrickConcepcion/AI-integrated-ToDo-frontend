<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <Header />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">My Tasks</h2>
        <button
          @click="showCreateModal = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Task
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-wrap gap-4">
        <select
          v-model="filters.category_id"
          @change="loadTasks"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          <option v-for="category in categoriesStore.categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <select
          v-model="filters.priority"
          @change="loadTasks"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        
      </div>

      <!-- Kanban Board -->
      <div v-if="tasksStore.loading" class="text-center py-12">
        <div class="text-gray-500">Loading tasks...</div>
      </div>

      <div v-else class="flex gap-6 overflow-x-scroll pb-4 lg:grid lg:grid-cols-3 lg:overflow-x-visible">
        <!-- Dynamic Columns -->
        <div
          v-for="column in columns"
          :key="column.id"
          class="bg-gray-100 rounded-lg p-3 min-w-[320px] flex-shrink-0 lg:min-w-0"
          @dragover.prevent
          @drop="onDrop(column.id, $event)"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">{{ column.title }}</h3>
            <span class="text-xs text-gray-500">{{ column.tasks.length }}</span>
          </div>
          <div class="space-y-3 h-[calc(100vh-200px)] overflow-y-auto">
            <div
              v-for="task in column.tasks"
              :key="task.id"
              class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-move"
              draggable="true"
              @dragstart="onDragStart(task, $event)"
            >
              <TaskCard
                :task="task"
                @archive="archiveTask"
                @delete="deleteTask"
                @complete="toggleComplete"
                @edit="openEditModal"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <CreateTaskModal v-model:show="showCreateModal" @created="handleTaskCreated" />
    <EditTaskModal v-model:show="showEditModal" :task="editingTask" @updated="handleTaskUpdated" />
    <ConfirmationModal
      v-model="confirmationState.open"
      :action-title="confirmationState.actionTitle"
      :message="confirmationState.message"
      :confirm-label="confirmationState.confirmLabel"
      cancel-label="Cancel"
      :loading="confirmationState.loading"
      @confirm="confirmTaskAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useTasksStore } from '../stores/tasks'
import { useCategoriesStore } from '../stores/categories'
import TaskCard from '../components/tasks/TaskCard.vue'
import CreateTaskModal from '../components/tasks/CreateTaskModal.vue'
import EditTaskModal from '../components/tasks/EditTaskModal.vue'
import ConfirmationModal from '../components/modals/ConfirmationModal.vue'
import Header from '../components/Header.vue'
import type { Task, TaskStatus } from '../types/task'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingTask = ref<Task | null>(null)
const filters = reactive({
  category_id: '',
  priority: '',
})

// Loading states
const togglingTaskId = ref<number | null>(null)
const archivingTaskId = ref<number | null>(null)
const deletingTaskId = ref<number | null>(null)

// Confirmation modal state
const confirmationState = reactive({
  open: false,
  actionTitle: '',
  message: '',
  confirmLabel: 'Confirm',
  loading: false,
})

// Track pending action
const pendingAction = ref<{ type: 'archive' | 'delete'; taskId: number } | null>(null)

onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories(),
    loadTasks()
  ])
})

const loadTasks = async () => {
  const activeFilters: Record<string, unknown> = {}
  if (filters.category_id) activeFilters.category_id = filters.category_id
  if (filters.priority) activeFilters.priority = filters.priority
  await tasksStore.fetchTasks(activeFilters)
}

// Modal event handlers
const handleTaskCreated = async () => {
  await loadTasks()
}

const handleTaskUpdated = async () => {
  await loadTasks()
}

const openEditModal = (task: Task) => {
  editingTask.value = task
  showEditModal.value = true
}

const toggleComplete = async (taskId: number): Promise<void> => {
  if (togglingTaskId.value) return // Prevent concurrent toggles

  togglingTaskId.value = taskId
  try {
    await tasksStore.toggleComplete(taskId)
  } catch (error) {
    console.error('Failed to toggle task:', error)
  } finally {
    togglingTaskId.value = null
  }
}

// Kanban drag-and-drop
const onDragStart = (task: any, event: DragEvent): void => {
  event.dataTransfer?.setData('text/plain', String(task.id))
}

const onDrop = async (status: TaskStatus, event: DragEvent): Promise<void> => {
  const id = Number(event.dataTransfer?.getData('text/plain'))
  if (!id) return
  try {
    await tasksStore.updateTaskStatus(id, status)
  } catch (error) {
    console.error('Failed to move task:', error)
  }
}

const columns = computed(() => [
  { title: 'Todo', id: 'todo' as TaskStatus, tasks: tasksStore.tasks.filter(t => t.status === 'todo') },
  { title: 'In Progress', id: 'in_progress' as TaskStatus, tasks: tasksStore.tasks.filter(t => t.status === 'in_progress') },
  { title: 'Completed', id: 'completed' as TaskStatus, tasks: tasksStore.tasks.filter(t => t.status === 'completed') },
])

const archiveTask = (taskId: number): void => {
  if (archivingTaskId.value) return // Prevent concurrent operations

  pendingAction.value = { type: 'archive', taskId }
  confirmationState.actionTitle = 'Archive Task'
  confirmationState.message = 'Archive this task?'
  confirmationState.confirmLabel = 'Archive'
  confirmationState.open = true
}

const deleteTask = (taskId: number): void => {
  if (deletingTaskId.value) return // Prevent concurrent operations

  pendingAction.value = { type: 'delete', taskId }
  confirmationState.actionTitle = 'Delete Task'
  confirmationState.message = 'Delete this task permanently?'
  confirmationState.confirmLabel = 'Delete'
  confirmationState.open = true
}

// Confirm task action (archive or delete)
const confirmTaskAction = async () => {
  if (!pendingAction.value) {
    confirmationState.open = false
    return
  }

  confirmationState.loading = true

  try {
    if (pendingAction.value.type === 'archive') {
      archivingTaskId.value = pendingAction.value.taskId
      await tasksStore.archiveTask(pendingAction.value.taskId)
      archivingTaskId.value = null
    } else {
      deletingTaskId.value = pendingAction.value.taskId
      await tasksStore.deleteTask(pendingAction.value.taskId)
      deletingTaskId.value = null
    }
  } catch (error) {
    console.error(`Failed to ${pendingAction.value.type} task:`, error)
    if (pendingAction.value.type === 'archive') {
      archivingTaskId.value = null
    } else {
      deletingTaskId.value = null
    }
  } finally {
    confirmationState.loading = false
    confirmationState.open = false
    pendingAction.value = null
  }
}
</script>
