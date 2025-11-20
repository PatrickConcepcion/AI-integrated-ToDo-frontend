<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Choose a new password to secure your account.
        </p>
      </div>

      <div v-if="!hasValidParams" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p class="text-sm">
          This password reset link is invalid or has expired.
        </p>
        <p class="mt-2 text-sm">
          You can request a new one from the
          <RouterLink to="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
            forgot password
          </RouterLink>
          page.
        </p>
      </div>

      <Form
        v-else
        @submit="handleResetPassword"
        :validation-schema="toTypedSchema(resetPasswordSchema)"
        :initial-values="{ password: '', password_confirmation: '' }"
        class="mt-8 space-y-6"
      >
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {{ authStore.error }}
        </div>

        <div v-if="submitted" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          Your password has been reset successfully. You can now sign in.
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <div class="mt-1 text-sm text-gray-900">
              {{ emailFromQuery }}
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">New password</label>
            <Field name="password" v-slot="{ field, errors }">
              <input
                v-bind="field"
                id="password"
                type="password"
                placeholder="Enter your new password"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:text-sm placeholder-gray-500"
                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
            </Field>
            <ErrorMessage name="password" class="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm new password</label>
            <Field name="password_confirmation" v-slot="{ field, errors }">
              <input
                v-bind="field"
                id="password_confirmation"
                type="password"
                placeholder="Confirm your new password"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:text-sm placeholder-gray-500"
                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
            </Field>
            <ErrorMessage name="password_confirmation" class="mt-1 text-sm text-red-600" />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading">Resetting password...</span>
            <span v-else>Reset password</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Remember your password?
            <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </RouterLink>
          </p>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { resetPasswordSchema } from '../validators/auth'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { success } = useToast()
const submitted = ref(false)

const emailFromQuery = computed(() => (route.query.email as string) || '')
const tokenFromQuery = computed(() => (route.query.token as string) || '')
const hasValidParams = computed(() => !!emailFromQuery.value && !!tokenFromQuery.value)

const handleResetPassword = async (values: any, actions: any) => {
  if (!hasValidParams.value) {
    return
  }

  try {
    await authStore.resetPassword({
      email: emailFromQuery.value,
      token: tokenFromQuery.value,
      password: values.password,
      password_confirmation: values.password_confirmation,
    })
    submitted.value = true
    success('Password reset successfully!')
    actions.resetForm()
    router.push({ name: 'Login' })
  } catch (error: any) {
    console.error('Password reset failed:', error)

    const validationErrors = error?.response?.data?.errors
    if (validationErrors) {
      const transformedErrors = Object.keys(validationErrors).reduce((acc, key) => {
        acc[key] = Array.isArray(validationErrors[key])
          ? validationErrors[key][0]
          : validationErrors[key]
        return acc
      }, {} as Record<string, string>)
      actions.setErrors(transformedErrors)
    }
  }
}
</script>
