<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="show" class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
          <form @submit.prevent="handleEditTask" class="space-y-4" novalidate>
            <div>
              <label class="block text-sm font-medium text-gray-700">Title</label>
            <Field
              name="title"
              type="text"
              class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
              :class="formErrors.title ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              placeholder="Enter task title"
            />
              <ErrorMessage name="title" class="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <Field
                name="description"
                as="textarea"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                :class="formErrors.description ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                placeholder="Enter task description (optional)"
              />
              <ErrorMessage name="description" class="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <Field
                name="category_id"
                as="select"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">No Category</option>
                <option v-for="category in tasksStore.categories" :key="category.id" :value="String(category.id)">
                  {{ category.name }}
                </option>
              </Field>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Priority</label>
              <Field
                name="priority"
                as="select"
                class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                :class="formErrors.priority ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Field>
              <ErrorMessage name="priority" class="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Due Date</label>
              <Field
                name="due_date"
                type="date"
                class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                :class="formErrors.due_date ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
              <ErrorMessage name="due_date" class="mt-1 text-sm text-red-600" />
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="emit('update:show', false)"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Updating...' : 'Update Task' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useTasksStore } from '../../stores/tasks'
import { taskSchema } from '../../validators/task'
import type { Task } from '../../types/task'
import { useToast } from '../../composables/useToast'

const tasksStore = useTasksStore()
const { success, toastError } = useToast()

interface Props {
  show: boolean
  task: Task | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'updated': []
}>()

const isSubmitting = ref(false)

// vee-validate form setup
const { handleSubmit, errors: formErrors, setValues } = useForm({
  validationSchema: toTypedSchema(taskSchema),
  initialValues: {
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    due_date: '',
  },
})

// Watch for task prop changes to populate form
watch(() => props.task, (newTask) => {
  if (newTask) {
    setValues({
      title: newTask.title,
      description: newTask.description || '',
      category_id: newTask.category_id ? String(newTask.category_id) : '',
      priority: newTask.priority || 'medium',
      due_date: newTask.due_date ? newTask.due_date.split('T')[0] : '',
    })
  }
}, { immediate: true })

const handleEditTask = handleSubmit(async (values) => {
  if (!props.task) {
    return
  }

  isSubmitting.value = true
  try {
    await tasksStore.updateTask(props.task.id, values)
    success('Task updated successfully!')
    emit('updated')
    emit('update:show', false)
  } catch (error) {
    console.error('Failed to update task:', error)
    toastError('Failed to update task. Please try again.')
  } finally {
    isSubmitting.value = false
  }
})
</script>
