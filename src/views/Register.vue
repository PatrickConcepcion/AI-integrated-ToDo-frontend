<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join AI Todo App today
        </p>
      </div>

      <Form
        @submit="handleRegister"
        :validation-schema="toTypedSchema(registerSchema)"
        :initial-values="{ name: '', email: '', password: '', password_confirmation: '' }"
        class="mt-8 space-y-6"
      >
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {{ authStore.error }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
            <Field name="name" v-slot="{ field, errors }">
              <input
                v-bind="field"
                id="name"
                type="text"
                placeholder="Enter your full name"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm placeholder-gray-500"
                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
            </Field>
            <ErrorMessage name="name" class="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <Field name="email" v-slot="{ field, errors }">
              <input
                v-bind="field"
                id="email"
                type="text"
                placeholder="Enter your email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm placeholder-gray-500"
                :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
              />
            </Field>
            <ErrorMessage name="email" class="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="relative">
              <Field name="password" v-slot="{ field, errors }">
                <input
                  v-bind="field"
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter password (min 8 characters)"
                  class="mt-1 appearance-none relative block w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm placeholder-gray-500"
                  :class="errors.length > 0 ? 'border-red-300 text-red-900 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:border-indigo-500'"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 z-10"
                  :class="errors.length > 0 ? 'mt-1' : 'mt-1'"
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </Field>
            </div>
            <ErrorMessage name="password" class="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div class="relative">
              <Field name="password_confirmation" v-slot="{ field, errors }">
                <input
                  v-bind="field"
                  id="password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
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
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in here
            </RouterLink>
          </p>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { registerSchema } from '../validators/auth'
import { Form, Field, ErrorMessage, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useToast } from '../composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { success, toastError } = useToast()
const { setErrors } = useForm()

// Password visibility toggle states
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegister = async (values: any) => {
  try {
    await authStore.register({
      name: values.name,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    })
    success('Registration successful! Welcome to AI Todo App.')
    router.push('/')
  } catch (error: any) {
    console.error('Registration failed:', error)

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
      toastError('Registration failed. Please check your information and try again.')
    }
  }
}
</script>
