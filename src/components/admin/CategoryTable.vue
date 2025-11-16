<template>
  <div class="space-y-4">
    <!-- Add New Category Form -->
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Add New Category</h4>
      <form @submit.prevent="handleCreateCategory" class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Name Input -->
          <div class="flex flex-col">
            <label for="new-name" class="block text-xs font-medium text-gray-700 mb-1">Name *</label>
            <Field
              id="new-name"
              name="name"
              type="text"
              placeholder="Enter category name"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 text-sm placeholder-gray-500"
              :class="formErrors.name ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
            />
            <div class="h-5">
              <ErrorMessage name="name" class="text-xs text-red-600" />
            </div>
          </div>

          <!-- Description Input -->
          <div class="flex flex-col">
            <label for="new-description" class="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <Field
              id="new-description"
              name="description"
              type="text"
              placeholder="Enter description (optional)"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 text-sm placeholder-gray-500"
              :class="formErrors.description ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
            />
            <div class="h-5">
              <ErrorMessage name="description" class="text-xs text-red-600" />
            </div>
          </div>

          <!-- Color Picker -->
          <div class="flex flex-col">
            <label for="new-color" class="block text-xs font-medium text-gray-700 mb-1">Color *</label>
            <div class="flex items-center gap-2">
              <Field
                id="new-color"
                name="color"
                type="color"
                class="h-10 w-16 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                @change="validateHexColor"
              />
              <input
                type="text"
                v-model="newCategoryColor"
                placeholder="#000000"
                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-500"
                @input="handleHexInput"
              />
            </div>
            <div class="h-5">
              <ErrorMessage name="color" class="text-xs text-red-600" />
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex flex-col">
            <div class="flex-1"></div>
            <button
              type="submit"
              :disabled="isCreating"
              class="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? 'Adding...' : 'Add Category' }}
            </button>
            <div class="h-5"></div>
          </div>
        </div>
      </form>
    </div>

    <!-- Categories Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Color
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Empty State -->
          <tr v-if="tasksStore.categories.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              No categories yet. Add one above to get started.
            </td>
          </tr>

          <!-- Category Rows -->
          <tr v-for="category in tasksStore.categories" :key="category.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingId === category.id">
                <Field
                  name="edit_name"
                  type="text"
                  class="w-full px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  :class="editFormErrors.edit_name ? 'border-red-300' : 'border-gray-300'"
                />
                <ErrorMessage name="edit_name" class="text-xs text-red-600 mt-1" />
              </div>
              <span v-else class="text-sm font-medium text-gray-900">{{ category.name }}</span>
            </td>

            <td class="px-6 py-4">
              <div v-if="editingId === category.id">
                <Field
                  name="edit_description"
                  type="text"
                  class="w-full px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                  :class="editFormErrors.edit_description ? 'border-red-300' : 'border-gray-300'"
                  placeholder="Enter description"
                />
                <ErrorMessage name="edit_description" class="text-xs text-red-600 mt-1" />
              </div>
              <span v-else class="text-sm text-gray-600">{{ category.description || '-' }}</span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingId === category.id">
                <div class="flex items-center gap-2">
                  <Field
                    name="edit_color"
                    type="color"
                    class="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                    @change="validateEditHexColor"
                  />
                  <input
                    type="text"
                    v-model="editCategoryColor"
                    placeholder="#000000"
                    class="w-24 px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                    :class="editFormErrors.edit_color ? 'border-red-300' : 'border-gray-300'"
                    @input="handleEditHexInput"
                  />
                </div>
                <ErrorMessage name="edit_color" class="text-xs text-red-600 mt-1" />
              </div>
              <div v-else class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded border border-gray-300"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="text-sm text-gray-600">{{ category.color }}</span>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <template v-if="editingId === category.id">
                <button
                  @click="handleSaveEdit"
                  :disabled="isSaving"
                  class="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSaving ? 'Saving...' : 'Save' }}
                </button>
                <button
                  @click="cancelEdit"
                  :disabled="isSaving"
                  class="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </template>
              <template v-else>
                <button
                  @click="startEdit(category)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  @click="handleDelete(category.id, category.name)"
                  :disabled="isDeleting === category.id"
                  class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isDeleting === category.id ? 'Deleting...' : 'Delete' }}
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useTasksStore } from '../../stores/tasks'
import { categorySchema } from '../../validators/task'
import type { Category } from '../../types/task'
import { z } from 'zod'
import { useToast } from '../../composables/useToast'

const tasksStore = useTasksStore()
const { success, toastError } = useToast()

// Edit schema with different field names to avoid conflicts
const editCategorySchema = z.object({
  edit_name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  edit_description: z.string().max(255, 'Description must be less than 255 characters').optional(),
  edit_color: z.string().regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, 'Invalid hex color'),
})

// New category form
const { handleSubmit, errors: formErrors, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(categorySchema),
  initialValues: {
    name: '',
    description: '',
    color: '#6366f1',
  },
})

// Edit category form
const {
  handleSubmit: handleEditSubmit,
  errors: editFormErrors,
  setValues: setEditValues,
  setFieldValue: setEditFieldValue,
  resetForm: resetEditForm
} = useForm({
  validationSchema: toTypedSchema(editCategorySchema),
  initialValues: {
    edit_name: '',
    edit_description: '',
    edit_color: '#6366f1',
  },
})

const newCategoryColor = ref('#6366f1')
const editCategoryColor = ref('#6366f1')
const isCreating = ref(false)

// Hex color validation regex: #RGB, #RGBA, #RRGGBB, or #RRGGBBAA
const hexColorRegex = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/

// Validate and format hex color input
const validateHexColor = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  newCategoryColor.value = value
  setFieldValue('color', value)
}

// Handle text input for hex color
const handleHexInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.trim()
  value = (value.startsWith('#') ? value : '#' + value).toUpperCase()

  if (hexColorRegex.test(value)) {
    newCategoryColor.value = value
    setFieldValue('color', value)
    input.setCustomValidity('')
  } else {
    input.setCustomValidity('Invalid hex color')
    input.reportValidity()
  }
}

// Validate and format hex color input for edit form
const validateEditHexColor = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  editCategoryColor.value = value
  setEditFieldValue('edit_color', value)
}

// Handle text input for hex color in edit form
const handleEditHexInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.trim()
  value = (value.startsWith('#') ? value : '#' + value).toUpperCase()

  if (hexColorRegex.test(value)) {
    editCategoryColor.value = value
    setEditFieldValue('edit_color', value)
    input.setCustomValidity('')
  } else {
    input.setCustomValidity('Invalid hex color')
    input.reportValidity()
  }
}

const editingId = ref<number | null>(null)
const isSaving = ref(false)
const isDeleting = ref<number | null>(null)

// Create new category
const handleCreateCategory = handleSubmit(async (values) => {
  isCreating.value = true
  try {
    await tasksStore.createCategory({
      ...values,
      color: newCategoryColor.value,
    })
    success('Category created successfully!')
    resetForm()
    newCategoryColor.value = '#6366f1'
  } catch (error) {
    console.error('Failed to create category:', error)
    toastError('Failed to create category. Please try again.')
  } finally {
    isCreating.value = false
  }
})

// Start editing
const startEdit = (category: Category) => {
  editingId.value = category.id
  editCategoryColor.value = category.color
  setEditValues({
    edit_name: category.name,
    edit_description: category.description || '',
    edit_color: category.color,
  })
}

// Cancel editing
const cancelEdit = () => {
  editingId.value = null
  editCategoryColor.value = '#6366f1'
  resetEditForm()
}

// Save edit
const handleSaveEdit = handleEditSubmit(async (values) => {
  if (editingId.value === null) return

  isSaving.value = true
  try {
    await tasksStore.updateCategory(editingId.value, {
      name: values.edit_name,
      description: values.edit_description || '',
      color: values.edit_color,
    })
    success('Category updated successfully!')
    cancelEdit()
  } catch (error) {
    console.error('Failed to update category:', error)
    toastError('Failed to update category. Please try again.')
  } finally {
    isSaving.value = false
  }
})

// Delete category
const handleDelete = async (categoryId: number, categoryName: string) => {
  if (!confirm(`Are you sure you want to delete "${categoryName}"? Tasks using this category will have their category removed.`)) {
    return
  }

  isDeleting.value = categoryId
  try {
    await tasksStore.deleteCategory(categoryId)
    success('Category deleted successfully!')
  } catch (error) {
    console.error('Failed to delete category:', error)
    toastError('Failed to delete category. Please try again.')
  } finally {
    isDeleting.value = null
  }
}
</script>
