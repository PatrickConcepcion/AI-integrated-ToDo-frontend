<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
        <p class="text-sm text-gray-600 mb-6">
          Update your password to keep your account secure.
        </p>

        <Form
          @submit="handleChangePassword"
          :validation-schema="toTypedSchema(changePasswordSchema)"
          :initial-values="{ current_password: '', password: '', password_confirmation: '' }"
          class="space-y-4"
        >
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {{ authStore.error }}
          </div>

          <div>
            <label for="current_password" class="block text-sm font-medium text-gray-700">Current password</label>
            <div class="relative">
              <Field name="current_password" v-slot="{ field, errors }">
                <input
                  v-bind="field"
                  id="current_password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Enter your current password"
                  class="mt-1 appearance-none relative block w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm placeholder-gray-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 z-10"
                  :class="errors.length > 0 ? 'mt-1' : 'mt-1'"
                  aria-label="Toggle current password visibility"
                >
                  <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </Field>
            </div>
            <ErrorMessage name="current_password" class="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">New password</label>
            <div class="relative">
              <Field name="password" v-slot="{ field, errors }">
                <input
                  v-bind="field"
                  id="password"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Enter a new password"
                  class="mt-1 appearance-none relative block w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm placeholder-gray-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 z-10"
                  :class="errors.length > 0 ? 'mt-1' : 'mt-1'"
                  aria-label="Toggle new password visibility"
                >
                  <EyeIcon v-if="!showNewPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </Field>
            </div>
            <ErrorMessage name="password" class="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm new password</label>
            <div class="relative">
              <Field name="password_confirmation" v-slot="{ field, errors }">
                <input
                  v-bind="field"
                  id="password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your new password"
                  class="mt-1 appearance-none relative block w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm placeholder-gray-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 z-10"
                  :class="errors.length > 0 ? 'mt-1' : 'mt-1'"
                  aria-label="Toggle confirm password visibility"
                >
                  <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </Field>
            </div>
            <ErrorMessage name="password_confirmation" class="mt-1 text-sm text-red-600" />
          </div>

          <div class="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              @click="router.back"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="authStore.loading">Updating...</span>
              <span v-else>Update password</span>
            </button>
          </div>
        </Form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Header from '../components/Header.vue'
import { changePasswordSchema } from '../validators/auth'
import { Form, Field, ErrorMessage, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useToast } from '../composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { success, toastError } = useToast()
const { setErrors, resetForm } = useForm()

// Password visibility toggle states
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const handleChangePassword = async (values: any) => {
  try {
    await authStore.changePassword({
      current_password: values.current_password,
      password: values.password,
      password_confirmation: values.password_confirmation,
    })
    success('Password changed successfully!')
    resetForm()
    router.back()
  } catch (error: any) {
    console.error('Change password failed:', error)

    const validationErrors = error?.response?.data?.errors
    if (validationErrors) {
      const transformedErrors = Object.keys(validationErrors).reduce((acc, key) => {
        acc[key] = Array.isArray(validationErrors[key])
          ? validationErrors[key][0]
          : validationErrors[key]
        return acc
      }, {} as Record<string, string>)
      setErrors(transformedErrors)
    } else {
      toastError('Failed to change password. Please try again.')
    }
  }
}
</script>
