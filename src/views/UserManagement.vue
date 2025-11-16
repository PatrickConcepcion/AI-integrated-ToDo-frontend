<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <Header />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
        <p class="text-sm text-gray-600 mt-1">Manage user accounts and ban if necessary</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Loading users...</p>
      </div>

      <!-- User Management -->
      <div v-else class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">All Users</h3>
        <p class="text-sm text-gray-600 mb-6">
          View and manage all user accounts. You can ban or unban users as needed.
        </p>

        <UserTable />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from '../components/Header.vue'
import UserTable from '../components/admin/UserTable.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await authStore.fetchUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
})
</script>
