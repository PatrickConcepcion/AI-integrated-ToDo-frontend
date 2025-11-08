<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-indigo-600">AI Todo</h1>
          </div>

          <!-- Desktop Navigation - hidden on sm/md -->
          <div class="hidden lg:flex items-center space-x-4">
            <RouterLink
              to="/"
              class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            >
              Tasks
            </RouterLink>
            <RouterLink
              to="/archived"
              class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            >
              Archived
            </RouterLink>
            <RouterLink
              v-if="authStore.isAdmin"
              to="/admin"
              class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            >
              AI Chat
            </RouterLink>
            <div class="text-sm text-gray-600">
              {{ authStore.user?.name }}
            </div>
            <button
              @click="handleLogout"
              class="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium"
            >
              Logout
            </button>
          </div>

          <!-- Mobile menu button - show on sm/md -->
          <div class="lg:hidden flex items-center">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <svg
                class="h-6 w-6"
                :class="mobileMenuOpen ? 'hidden' : 'block'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                class="h-6 w-6"
                :class="mobileMenuOpen ? 'block' : 'hidden'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu - show on sm/md when open -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-250 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="lg:hidden border-t border-gray-200">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <RouterLink
            to="/"
            @click="mobileMenuOpen = false"
            class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
          >
            Tasks
          </RouterLink>
          <RouterLink
            to="/archived"
            @click="mobileMenuOpen = false"
            class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
          >
            Archived
          </RouterLink>
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            @click="mobileMenuOpen = false"
            class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
          >
            AI Chat
          </RouterLink>
          <div class="px-3 py-2 text-base text-gray-600 border-t border-gray-200">
            {{ authStore.user?.name }}
          </div>
          <button
            @click="handleLogout"
            class="block w-full text-left text-gray-700 hover:text-red-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
          >
            Logout
          </button>
        </div>
        </div>
      </Transition>
    </nav>

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

      <div v-else-if="tasksStore.tasks.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-gray-500">No tasks found. Create your first task!</p>
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
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTasksStore } from '../stores/tasks'
import { debounce } from 'lodash-es'
import TaskCard from '../components/tasks/TaskCard.vue'
import CreateTaskModal from '../components/tasks/CreateTaskModal.vue'
import EditTaskModal from '../components/tasks/EditTaskModal.vue'
import type { Task } from '../types/task'

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingTask = ref<Task | null>(null)
const mobileMenuOpen = ref(false)
const filters = reactive({
  category_id: '',
  priority: '',
})

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

const toggleComplete = debounce(async (taskId: number): Promise<void> => {
  try {
    await tasksStore.toggleComplete(taskId)
  } catch (error) {
    console.error('Failed to toggle task:', error)
  }
}, 300)

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

const archiveTask = debounce(async (taskId: number): Promise<void> => {
  if (confirm('Archive this task?')) {
    try {
      await tasksStore.archiveTask(taskId)
    } catch (error) {
      console.error('Failed to archive task:', error)
    }
  }
}, 300)

const deleteTask = debounce(async (taskId: number): Promise<void> => {
  if (confirm('Delete this task permanently?')) {
    try {
      await tasksStore.deleteTask(taskId)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }
}, 300)

const handleLogout = debounce(async () => {
  await authStore.logout()
  router.push('/login')
}, 300)
</script>
