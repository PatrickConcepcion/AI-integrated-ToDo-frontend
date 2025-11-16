<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Error Display -->
      <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
        {{ authStore.error }}
        <button
          @click="authStore.error = null"
          class="absolute top-0 right-0 mt-3 mr-3 text-red-400 hover:text-red-600"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-indigo-600">AI Todo</h1>
        </div>

        <!-- Desktop Navigation - hidden on sm/md -->
        <div class="hidden lg:flex items-center space-x-4">
          <RouterLink
            to="/"
            class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-indigo-600 border-b-2 border-indigo-600': $route.path === '/' }"
          >
            Tasks
          </RouterLink>
          <RouterLink
            to="/tasks/archived"
            class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-indigo-600 border-b-2 border-indigo-600': $route.path === '/tasks/archived' }"
          >
            Archived
          </RouterLink>
          <RouterLink
            to="/ai-assistant"
            class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-indigo-600 border-b-2 border-indigo-600': $route.path === '/ai-assistant' }"
          >
            AI Assistant
          </RouterLink>
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-indigo-600 border-b-2 border-indigo-600': $route.path === '/admin' }"
          >
            Categories
          </RouterLink>
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin/users"
            class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            :class="{ 'text-indigo-600 border-b-2 border-indigo-600': $route.path === '/admin/users' }"
          >
            Users
          </RouterLink>
          <div v-if="authStore.user" class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            >
              <span class="mr-2 max-w-[150px] truncate">
                {{ authStore.user.name }}
              </span>
              <svg
                class="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
            >
              <button
                @click="goToChangePassword"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Change Password
              </button>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu button - show on sm/md -->
        <div class="lg:hidden flex items-center">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-label="Toggle mobile menu"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
          >
            <svg
              class="h-6 w-6"
              :class="mobileMenuOpen ? 'hidden' : 'block'"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              class="h-6 w-6"
              :class="mobileMenuOpen ? 'block' : 'hidden'"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu - show on sm/md when open -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" id="mobile-menu" class="lg:hidden border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <RouterLink
          to="/"
          @click="mobileMenuOpen = false"
          class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
        >
          Tasks
        </RouterLink>
        <RouterLink
          to="/tasks/archived"
          @click="mobileMenuOpen = false"
          class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
        >
          Archived
        </RouterLink>
        <RouterLink
          to="/ai-assistant"
          @click="mobileMenuOpen = false"
          class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
        >
          AI Assistant
        </RouterLink>
        <RouterLink
          v-if="authStore.isAdmin"
          to="/admin"
          @click="mobileMenuOpen = false"
          class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
        >
          Categories
        </RouterLink>
        <RouterLink
          v-if="authStore.isAdmin"
          to="/admin/users"
          @click="mobileMenuOpen = false"
          class="block text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
        >
          Users
        </RouterLink>
        <div class="px-3 py-3 text-base text-gray-600 border-t border-gray-200">
          <div class="font-medium">
            {{ authStore.user?.name }}
          </div>
          <div class="mt-2 space-y-1">
            <button
              @click="goToChangePassword"
              class="block w-full text-left text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
            >
              Change Password
            </button>
            <button
              @click="handleLogout"
              class="block w-full text-left text-gray-700 hover:text-red-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const goToChangePassword = () => {
  userMenuOpen.value = false
  mobileMenuOpen.value = false
  router.push({ name: 'ChangePassword' })
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    authStore.error = 'Failed to logout properly.'
  }
}
</script>
