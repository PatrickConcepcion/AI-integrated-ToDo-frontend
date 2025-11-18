<template>
  <div class="space-y-4">
    <!-- Add New Category Form -->
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Add New Category</h4>
      <Form
        @submit="handleCreateCategory"
        :validation-schema="toTypedSchema(categorySchema)"
        :initial-values="{ name: '', description: '', color: '#6366f1' }"
        class="space-y-3"
        v-slot="{ setFieldValue }"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
          <!-- Name Input -->
          <div>
            <label for="new-name" class="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <Field name="name" v-slot="{ field, errors }">
              <input
                v-bind="field"
                id="new-name"
                type="text"
                placeholder="Enter category name"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 text-sm placeholder-gray-500"
                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
            </Field>
            <div class="h-5 mt-1">
              <ErrorMessage name="name" class="text-xs text-red-600" />
            </div>
          </div>

          <!-- Description Input -->
          <div>
            <label for="new-description" class="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <Field name="description" v-slot="{ field, errors }">
              <input
                v-bind="field"
                id="new-description"
                type="text"
                placeholder="Enter description (optional)"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 text-sm placeholder-gray-500"
                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
            </Field>
            <div class="h-5 mt-1">
              <ErrorMessage name="description" class="text-xs text-red-600" />
            </div>
          </div>

          <!-- Color Picker -->
          <div>
            <label for="new-color" class="block text-xs font-medium text-gray-700 mb-1">Color *</label>
            <Field name="color" v-slot="{ field, errors }">
              <div class="flex items-center gap-2">
                <input
                  v-bind="field"
                  id="new-color"
                  type="color"
                  class="h-10 w-16 border rounded cursor-pointer flex-shrink-0"
                  :class="errors.length > 0 ? 'border-red-300' : 'border-gray-300'"
                  @change="(event) => validateHexColor(event, setFieldValue)"
                />
                <input
                  type="text"
                  v-model="newCategoryColor"
                  placeholder="#000000"
                  class="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 text-sm placeholder-gray-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'"
                  @input="(event) => handleHexInput(event, setFieldValue)"
                />
              </div>
            </Field>
            <div class="h-5 mt-1">
              <ErrorMessage name="color" class="text-xs text-red-600" />
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1 invisible">Action</label>
            <button
              type="submit"
              :disabled="isCreating"
              class="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? 'Adding...' : 'Add Category' }}
            </button>
            <div class="h-5 mt-1"></div>
          </div>
        </div>
      </Form>
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
            <template v-if="editingId === category.id">
              <td colspan="4" class="px-0 py-0">
                <Form
                  @submit="handleSaveEdit"
                  :validation-schema="toTypedSchema(editCategorySchema)"
                  :initial-values="{ edit_name: category.name, edit_description: category.description || '', edit_color: category.color }"
                  v-slot="{ setFieldValue }"
                >
                  <table class="min-w-full">
                    <tbody>
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap align-top" style="width: 25%">
                          <div class="flex flex-col">
                            <Field name="edit_name" v-slot="{ field, errors }">
                              <input
                                v-bind="field"
                                type="text"
                                class="w-full px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500"
                                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'"
                              />
                            </Field>
                            <ErrorMessage name="edit_name" class="mt-1 text-xs text-red-600" />
                          </div>
                        </td>

                        <td class="px-6 py-4 align-top" style="width: 25%">
                          <div class="flex flex-col">
                            <Field name="edit_description" v-slot="{ field, errors }">
                              <input
                                v-bind="field"
                                type="text"
                                placeholder="Enter description"
                                class="w-full px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'"
                              />
                            </Field>
                          <ErrorMessage name="edit_description" class="mt-1 text-xs text-red-600" />
                          </div>
                        </td>

                        <td class="px-6 py-4 whitespace-nowrap align-top" style="width: 25%">
                          <div class="flex flex-col">
                            <Field name="edit_color" v-slot="{ field, errors }">
                              <div class="flex items-center gap-2">
                                <input
                                  v-bind="field"
                                  type="color"
                                  class="h-8 w-12 border rounded cursor-pointer"
                                  :class="errors.length > 0 ? 'border-red-300' : 'border-gray-300'"
                                  @change="(event) => validateEditHexColor(event, setFieldValue)"
                                />
                                <input
                                  type="text"
                                  v-model="editCategoryColor"
                                  placeholder="#000000"
                                  class="w-24 px-2 py-1 text-sm border rounded focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'"
                                  @input="(event) => handleEditHexInput(event, setFieldValue)"
                                />
                              </div>
                            </Field>
                            <ErrorMessage name="edit_color" class="mt-1 text-xs text-red-600" />
                          </div>
                        </td>

                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 align-top" style="width: 25%">
                          <div class="flex gap-2 items-start">
                            <button
                              type="submit"
                              :disabled="isSaving"
                              class="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {{ isSaving ? 'Updating...' : 'Update' }}
                            </button>
                            <button
                              type="button"
                              @click="cancelEdit"
                              :disabled="isSaving"
                              class="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Form>
              </td>
            </template>
            <template v-else>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ category.name }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600">{{ category.description || '-' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded border border-gray-300"
                    :style="{ backgroundColor: category.color }"
                  ></div>
                  <span class="text-sm text-gray-600">{{ category.color }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      v-model="confirmationState.open"
      :action-title="confirmationState.actionTitle"
      :message="confirmationState.message"
      :confirm-label="confirmationState.confirmLabel"
      cancel-label="Cancel"
      :loading="confirmationState.loading"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useCategoriesStore } from '../../stores/categories'
import { categorySchema } from '../../validators/task'
import type { Category } from '../../types/task'
import { z } from 'zod'
import { useToast } from '../../composables/useToast'
import ConfirmationModal from '../modals/ConfirmationModal.vue'

const categoriesStore = useCategoriesStore()
const { success, toastError } = useToast()

// Edit schema with different field names to avoid conflicts
const editCategorySchema = z.object({
  edit_name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  edit_description: z.string().max(255, 'Description must be less than 255 characters').optional(),
  edit_color: z.string().regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i, 'Invalid hex color'),
})

const newCategoryColor = ref('#6366f1')
const editCategoryColor = ref('#6366f1')
const isCreating = ref(false)

// Hex color validation regex: #RGB, #RGBA, #RRGGBB, or #RRGGBBAA
const hexColorRegex = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/

type SetFieldValueFn = (field: string, value: unknown) => void

// Validate and format hex color input for create form
const validateHexColor = (event: Event, setFieldValue: SetFieldValueFn) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  newCategoryColor.value = value
  setFieldValue('color', value)
}

// Handle text input for hex color (create form)
const handleHexInput = (event: Event, setFieldValue: SetFieldValueFn) => {
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
const validateEditHexColor = (event: Event, setFieldValue: SetFieldValueFn) => {
  const input = event.target as HTMLInputElement
  const value = input.value
  editCategoryColor.value = value
  setFieldValue('edit_color', value)
}

// Handle text input for hex color in edit form
const handleEditHexInput = (event: Event, setFieldValue: SetFieldValueFn) => {
  const input = event.target as HTMLInputElement
  let value = input.value.trim()
  value = (value.startsWith('#') ? value : '#' + value).toUpperCase()

  if (hexColorRegex.test(value)) {
    editCategoryColor.value = value
    setFieldValue('edit_color', value)
    input.setCustomValidity('')
  } else {
    input.setCustomValidity('Invalid hex color')
    input.reportValidity()
  }
}

const editingId = ref<number | null>(null)
const isSaving = ref(false)
const isDeleting = ref<number | null>(null)

// Confirmation modal state
const confirmationState = reactive({
  open: false,
  actionTitle: '',
  message: '',
  confirmLabel: 'Confirm',
  loading: false,
})

// Track pending delete
const pendingDelete = ref<{ id: number; name: string } | null>(null)

// Create new category
const handleCreateCategory = async (values: any, actions: any) => {
  isCreating.value = true
  try {
    await categoriesStore.createCategory({
      ...values,
      color: newCategoryColor.value,
    })
    success('Category created successfully!')
    actions.resetForm()
    newCategoryColor.value = '#6366f1'
  } catch (error: any) {
    console.error('Failed to create category:', error)

    // Extract backend validation errors and set them in the form
    const validationErrors = error?.response?.data?.errors
    if (validationErrors) {
      // Transform Laravel's array-based errors to VeeValidate's string-based errors
      const transformedErrors = Object.keys(validationErrors).reduce((acc, key) => {
        acc[key] = Array.isArray(validationErrors[key])
          ? validationErrors[key][0]
          : validationErrors[key]
        return acc
      }, {} as Record<string, string>)
      actions.setErrors(transformedErrors)
    } else {
      toastError('Failed to create category. Please try again.')
    }
  } finally {
    isCreating.value = false
  }
}

// Start editing
const startEdit = (category: Category) => {
  editingId.value = category.id
  editCategoryColor.value = category.color
}

// Cancel editing
const cancelEdit = () => {
  editingId.value = null
  editCategoryColor.value = '#6366f1'
}

// Save edit
const handleSaveEdit = async (values: any, actions: any) => {
  if (editingId.value === null) return

  isSaving.value = true
  try {
    await categoriesStore.updateCategory(editingId.value, {
      name: values.edit_name,
      description: values.edit_description || '',
      color: values.edit_color,
    })
    success('Category updated successfully!')
    cancelEdit()
  } catch (error: any) {
    console.error('Failed to update category:', error)

    const validationErrors = error?.response?.data?.errors
    if (validationErrors) {
      // Transform Laravel's array-based errors to VeeValidate's string-based errors
      // and map field names to edit form field names
      const transformedErrors = Object.keys(validationErrors).reduce((acc, key) => {
        const editFieldName = key === 'name' ? 'edit_name' : key === 'description' ? 'edit_description' : key === 'color' ? 'edit_color' : key
        acc[editFieldName] = Array.isArray(validationErrors[key])
          ? validationErrors[key][0]
          : validationErrors[key]
        return acc
      }, {} as Record<string, string>)
      actions.setErrors(transformedErrors)
    } else {
      toastError('Failed to update category. Please try again.')
    }
  } finally {
    isSaving.value = false
  }
}

// Delete category
const handleDelete = (categoryId: number, categoryName: string) => {
  pendingDelete.value = { id: categoryId, name: categoryName }
  confirmationState.actionTitle = 'Delete Category'
  confirmationState.message = `Are you sure you want to delete "${categoryName}"? Tasks using this category will have their category removed.`
  confirmationState.confirmLabel = 'Delete'
  confirmationState.open = true
}

// Confirm delete
const confirmDelete = async () => {
  if (!pendingDelete.value) {
    confirmationState.open = false
    return
  }

  confirmationState.loading = true
  isDeleting.value = pendingDelete.value.id

  try {
    await categoriesStore.deleteCategory(pendingDelete.value.id)
    success('Category deleted successfully!')
  } catch (error) {
    console.error('Failed to delete category:', error)
    toastError('Failed to delete category. Please try again.')
  } finally {
    confirmationState.loading = false
    confirmationState.open = false
    isDeleting.value = null
    pendingDelete.value = null
  }
}
</script>
