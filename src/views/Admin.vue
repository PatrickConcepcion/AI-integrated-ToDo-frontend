<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <Header />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <p class="text-sm text-gray-600 mt-1">Manage categories and system settings</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-500">Loading categories...</div>
      </div>

      <!-- Category Management -->
      <div v-else class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Management</h3>
        <p class="text-sm text-gray-600 mb-6">
          Manage task categories available across the application. Users can assign these categories to their tasks.
        </p>

        <CategoryTable />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from '../components/Header.vue'
import CategoryTable from '../components/admin/CategoryTable.vue'
import { useCategoriesStore } from '../stores/categories'

const categoriesStore = useCategoriesStore()
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loading.value = false
  }
})
</script>
