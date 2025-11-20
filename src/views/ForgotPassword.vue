<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a reset link.
        </p>
      </div>

      <Form
        @submit="handleForgotPassword"
        :validation-schema="toTypedSchema(forgotPasswordSchema)"
        :initial-values="{ email: '' }"
        class="mt-8 space-y-6"
      >
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {{ authStore.error }}
        </div>

        <div v-if="submitted" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          If an account exists for that email, a password reset link has been sent.
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <Field name="email" v-slot="{ field, errors }">
              <input
                v-bind="field"
                id="email"
                type="email"
                placeholder="Enter your email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:text-sm placeholder-gray-500"
                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
            </Field>
            <ErrorMessage name="email" class="mt-1 text-sm text-red-600" />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading">Sending reset link...</span>
            <span v-else>Send reset link</span>
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
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { forgotPasswordSchema } from '../validators/auth'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

const authStore = useAuthStore()
const submitted = ref(false)

const handleForgotPassword = async (values: any, actions: any) => {
  try {
    await authStore.requestPasswordReset({
      email: values.email,
    })
    submitted.value = true
  } catch (error: any) {
    console.error('Forgot password request failed:', error)

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
