<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
      <Form
        @submit="handleCreateTask"
        :validation-schema="toTypedSchema(taskSchema)"
        :initial-values="{ title: '', description: '', category_id: '', priority: 'medium', due_date: '' }"
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
            {{ isSubmitting ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useTasksStore } from '../../stores/tasks'
import { useCategoriesStore } from '../../stores/categories'
import { taskSchema } from '../../validators/task'
import { useToast } from '../../composables/useToast'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const { success, toastError } = useToast()

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'created': []
}>()

const isSubmitting = ref(false)

const handleCreateTask = async (values: any, actions: any) => {
  isSubmitting.value = true
  try {
    await tasksStore.createTask(values)
    success('Task created successfully!')
    emit('created')
    emit('update:show', false)
    actions.resetForm()
  } catch (error: any) {
    console.error('Failed to create task:', error)

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
      toastError('Failed to create task. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
