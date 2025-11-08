<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
      <form @submit="handleCreateTask" class="space-y-4" novalidate>
        <div>
          <label class="block text-sm font-medium text-gray-700">Title</label>
          <Field
            name="title"
            type="text"
            class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            :class="formErrors.title ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
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
            class="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            :class="formErrors.description ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
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
            <option v-for="category in tasksStore.categories" :key="category.id" :value="category.id">
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
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { debounce } from 'lodash-es'
import { useTasksStore } from '../../stores/tasks'
import { taskSchema } from '../../validators/task'

const tasksStore = useTasksStore()

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'created': []
}>()

// vee-validate form setup
const { handleSubmit, errors: formErrors, resetForm } = useForm({
  validationSchema: toTypedSchema(taskSchema),
  initialValues: {
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    due_date: '',
  },
})

const handleCreateTask = handleSubmit(debounce(async (values) => {
  try {
    await tasksStore.createTask(values)
    emit('created')
    emit('update:show', false)
    resetForm()
  } catch (error) {
    console.error('Failed to create task:', error)
  }
}, 300))
</script>
