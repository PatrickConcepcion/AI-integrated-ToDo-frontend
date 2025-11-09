<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
          AI Todo App
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit="handleLogin" novalidate>
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {{ authStore.error }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <Field
              id="email"
              name="email"
              type="text"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:text-sm"
              :class="errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:border-indigo-500'"
              placeholder="Enter your email"
            />
            <ErrorMessage name="email" class="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <Field
              id="password"
              name="password"
              type="password"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:text-sm"
              :class="errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500' : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:border-indigo-500'"
              placeholder="Enter your password"
            />
            <ErrorMessage name="password" class="mt-1 text-sm text-red-600" />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="authStore.loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <RouterLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </RouterLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { loginSchema } from '../validators/auth'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

const router = useRouter()
const authStore = useAuthStore()

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const handleLogin = handleSubmit(async (values) => {
  try {
    await authStore.login({
      email: values.email,
      password: values.password,
    })
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  }
})
</script>
