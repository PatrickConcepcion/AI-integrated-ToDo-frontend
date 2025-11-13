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
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
          <tr v-if="categoriesStore.categories.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              No categories yet. Add one above to get started.
            </td>
          </tr>

          <!-- Category Rows -->
          <tr v-for="category in categoriesStore.categories" :key="category.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingId === category.id">
                <input
                  type="text"
                  v-model="editForm.name"
                  class="w-full px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  :class="editErrors.name ? 'border-red-300' : 'border-gray-300'"
                />
                <p v-if="editErrors.name" class="text-xs text-red-600 mt-1">{{ editErrors.name }}</p>
              </div>
              <span v-else class="text-sm font-medium text-gray-900">{{ category.name }}</span>
            </td>

            <td class="px-6 py-4">
              <div v-if="editingId === category.id">
                <input
                  type="text"
                  v-model="editForm.description"
                  class="w-full px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  :class="editErrors.description ? 'border-red-300' : 'border-gray-300'"
                  placeholder="Enter description"
                />
                <p v-if="editErrors.description" class="text-xs text-red-600 mt-1">{{ editErrors.description }}</p>
              </div>
              <span v-else class="text-sm text-gray-600">{{ category.description || '-' }}</span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="editingId === category.id">
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    v-model="editForm.color"
                    class="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    v-model="editForm.color"
                    class="w-24 px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                    :class="editErrors.color ? 'border-red-300' : 'border-gray-300'"
                  />
                </div>
                <p v-if="editErrors.color" class="text-xs text-red-600 mt-1">{{ editErrors.color }}</p>
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
                  @click="handleSaveEdit(category.id)"
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
import { ref, reactive } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useCategoriesStore } from '../../stores/categories'
import { categorySchema } from '../../validators/task'
import type { Category } from '../../types/category'

const categoriesStore = useCategoriesStore()

// New category form
const { handleSubmit, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(categorySchema),
  initialValues: {
    name: '',
    description: '',
    color: '#6366f1',
  },
})

const newCategoryColor = ref('#6366f1')
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

const editingId = ref<number | null>(null)
const editForm = reactive({
  name: '',
  description: '',
  color: '',
})
const editErrors = reactive<Record<string, string>>({
  name: '',
  description: '',
  color: '',
})
const isSaving = ref(false)
const isDeleting = ref<number | null>(null)

// Create new category
const handleCreateCategory = handleSubmit(async (values) => {
  isCreating.value = true
  try {
    await categoriesStore.createCategory({
      ...values,
      color: newCategoryColor.value,
    })
    resetForm()
    newCategoryColor.value = '#6366f1'
  } catch (error) {
    console.error('Failed to create category:', error)
  } finally {
    isCreating.value = false
  }
})

// Start editing
const startEdit = (category: Category) => {
  editingId.value = category.id
  editForm.name = category.name
  editForm.description = category.description || ''
  editForm.color = category.color
  // Clear any previous errors
  editErrors.name = ''
  editErrors.description = ''
  editErrors.color = ''
}

// Cancel editing
const cancelEdit = () => {
  editingId.value = null
  editForm.name = ''
  editForm.description = ''
  editForm.color = ''
  editErrors.name = ''
  editErrors.description = ''
  editErrors.color = ''
}

// Validate edit form
const validateEditForm = (): boolean => {
  // Clear previous errors
  editErrors.name = ''
  editErrors.description = ''
  editErrors.color = ''

  // Validate using Zod schema
  const result = categorySchema.safeParse({
    name: editForm.name,
    description: editForm.description || '',
    color: editForm.color,
  })

  if (!result.success) {
    // Map Zod errors to editErrors
    result.error.errors.forEach((err) => {
      const field = err.path[0] as string
      if (field in editErrors) {
        editErrors[field] = err.message
      }
    })
    return false
  }

  return true
}

// Save edit
const handleSaveEdit = async (categoryId: number) => {
  // Validate before saving
  if (!validateEditForm()) {
    return
  }

  isSaving.value = true
  try {
    await categoriesStore.updateCategory(categoryId, {
      name: editForm.name,
      description: editForm.description || '',
      color: editForm.color,
    })
    cancelEdit()
  } catch (error) {
    console.error('Failed to update category:', error)
  } finally {
    isSaving.value = false
  }
}

// Delete category
const handleDelete = async (categoryId: number, categoryName: string) => {
  if (!confirm(`Are you sure you want to delete "${categoryName}"? Tasks using this category will have their category removed.`)) {
    return
  }

  isDeleting.value = categoryId
  try {
    await categoriesStore.deleteCategory(categoryId)
  } catch (error) {
    console.error('Failed to delete category:', error)
  } finally {
    isDeleting.value = null
  }
}
</script>
