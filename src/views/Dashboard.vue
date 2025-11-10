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
          <option v-for="category in tasksStore.categories" :key="category.id" :value="category.id">
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

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Todo Column -->
        <div class="bg-gray-100 rounded-lg p-3" @dragover.prevent @drop="onDrop('todo', $event)">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">Todo</h3>
            <span class="text-xs text-gray-500">{{ todoTasks.length }}</span>
          </div>
          <div class="space-y-3 min-h-[100px]">
            <div
              v-for="task in todoTasks"
              :key="task.id"
              class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-move"
              draggable="true"
              @dragstart="onDragStart(task, $event)"
            >
              <TaskCard :task="task" @archive="archiveTask" @delete="deleteTask" @complete="toggleComplete" @edit="openEditModal" />
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="bg-gray-100 rounded-lg p-3" @dragover.prevent @drop="onDrop('in_progress', $event)">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">In Progress</h3>
            <span class="text-xs text-gray-500">{{ inProgressTasks.length }}</span>
          </div>
          <div class="space-y-3 min-h-[100px]">
            <div
              v-for="task in inProgressTasks"
              :key="task.id"
              class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-move"
              draggable="true"
              @dragstart="onDragStart(task, $event)"
            >
              <TaskCard :task="task" @archive="archiveTask" @delete="deleteTask" @complete="toggleComplete" @edit="openEditModal" />
            </div>
          </div>
        </div>

        <!-- Completed Column -->
        <div class="bg-gray-100 rounded-lg p-3" @dragover.prevent @drop="onDrop('completed', $event)">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">Completed</h3>
            <span class="text-xs text-gray-500">{{ completedTasks.length }}</span>
          </div>
          <div class="space-y-3 min-h-[100px]">
            <div
              v-for="task in completedTasks"
              :key="task.id"
              class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-move"
              draggable="true"
              @dragstart="onDragStart(task, $event)"
            >
              <TaskCard :task="task" @archive="archiveTask" @delete="deleteTask" @complete="toggleComplete" @edit="openEditModal" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <CreateTaskModal v-model:show="showCreateModal" @created="handleTaskCreated" />
    <EditTaskModal v-model:show="showEditModal" :task="editingTask" @updated="handleTaskUpdated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useTasksStore } from '../stores/tasks'
import TaskCard from '../components/tasks/TaskCard.vue'
import CreateTaskModal from '../components/tasks/CreateTaskModal.vue'
import EditTaskModal from '../components/tasks/EditTaskModal.vue'
import Header from '../components/Header.vue'
import type { Task } from '../types/task'

const tasksStore = useTasksStore()

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

onMounted(async () => {
  await tasksStore.fetchCategories()
  await loadTasks()
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

const onDrop = async (status: string, event: DragEvent): Promise<void> => {
  const id = Number(event.dataTransfer?.getData('text/plain'))
  if (!id) return
  try {
    await tasksStore.updateTaskStatus(id, status)
  } catch (error) {
    console.error('Failed to move task:', error)
  }
}

const todoTasks = computed(() => tasksStore.tasks.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => tasksStore.tasks.filter(t => t.status === 'in_progress'))
const completedTasks = computed(() => tasksStore.tasks.filter(t => t.status === 'completed'))

const archiveTask = async (taskId: number): Promise<void> => {
  if (archivingTaskId.value) return // Prevent concurrent operations

  if (!confirm('Archive this task?')) return

  archivingTaskId.value = taskId
  try {
    await tasksStore.archiveTask(taskId)
  } catch (error) {
    console.error('Failed to archive task:', error)
  } finally {
    archivingTaskId.value = null
  }
}

const deleteTask = async (taskId: number): Promise<void> => {
  if (deletingTaskId.value) return // Prevent concurrent operations

  if (!confirm('Delete this task permanently?')) return

  deletingTaskId.value = taskId
  try {
    await tasksStore.deleteTask(taskId)
  } catch (error) {
    console.error('Failed to delete task:', error)
  } finally {
    deletingTaskId.value = null
  }
}
</script>
