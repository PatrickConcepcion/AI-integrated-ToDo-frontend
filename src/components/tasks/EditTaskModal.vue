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
          <Form
            @submit="handleEditTask"
            :validation-schema="toTypedSchema(taskSchema)"
            :initial-values="formInitialValues"
            class="space-y-4"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <Field name="title" v-slot="{ field, errors }">
                <input
                  v-bind="field"
                  type="text"
                  placeholder="Enter task title"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                />
              </Field>
              <ErrorMessage name="title" class="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <Field name="description" v-slot="{ field, errors }">
                <textarea
                  v-bind="field"
                  rows="3"
                  placeholder="Enter task description (optional)"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                />
              </Field>
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
                <option v-for="category in categoriesStore.categories" :key="category.id" :value="String(category.id)">
                  {{ category.name }}
                </option>
              </Field>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Priority</label>
              <Field name="priority" v-slot="{ field, errors }">
                <select
                  v-bind="field"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <ErrorMessage name="priority" class="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Due Date</label>
              <Field name="due_date" v-slot="{ field, errors }">
                <input
                  v-bind="field"
                  type="date"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                />
              </Field>
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
          </Form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useTasksStore } from '../../stores/tasks'
import { useCategoriesStore } from '../../stores/categories'
import { taskSchema } from '../../validators/task'
import type { Task } from '../../types/task'
import { useToast } from '../../composables/useToast'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
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

// Compute initial values reactively from task prop
const formInitialValues = computed(() => {
  if (!props.task) {
    return {
      title: '',
      description: '',
      category_id: '',
      priority: 'medium',
      due_date: '',
    }
  }

  return {
    title: props.task.title,
    description: props.task.description || '',
    category_id: props.task.category_id ? String(props.task.category_id) : '',
    priority: props.task.priority || 'medium',
    due_date: props.task.due_date ? props.task.due_date.split('T')[0] : '',
  }
})

const handleEditTask = async (values: any, actions: any) => {
  if (!props.task) {
    return
  }

  isSubmitting.value = true
  try {
    await tasksStore.updateTask(props.task.id, values)
    success('Task updated successfully!')
    emit('updated')
    emit('update:show', false)
  } catch (error: any) {
    console.error('Failed to update task:', error)

    const validationErrors = error?.response?.data?.errors
    if (validationErrors) {
      const transformedErrors = Object.keys(validationErrors).reduce((acc, key) => {
        acc[key] = Array.isArray(validationErrors[key])
          ? validationErrors[key][0]
          : validationErrors[key]
        return acc
      }, {} as Record<string, string>)
      actions.setErrors(transformedErrors)
    } else {
      toastError('Failed to update task. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
