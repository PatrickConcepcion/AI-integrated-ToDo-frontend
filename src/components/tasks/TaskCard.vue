<template>
  <div class="flex items-start justify-between">
    <div class="flex items-start space-x-3 flex-1">
      <button
        @click.stop="$emit('complete', task.id)"
        class="mt-1 h-5 w-5 flex items-center justify-center rounded border border-gray-300 text-indigo-600 hover:bg-indigo-50"
        :title="task.completed_at ? 'Mark as Incomplete' : 'Mark as Completed'"
      >
        <span v-if="task.completed_at">✓</span>
      </button>
      <div class="flex-1">
        <h3 :class="['text-lg font-medium', task.completed_at ? 'line-through text-gray-400' : 'text-gray-900']">
          {{ task.title }}
        </h3>
        <p v-if="task.description" class="text-sm text-gray-600 mt-1">
          {{ task.description }}
        </p>
        <div class="flex flex-wrap items-center gap-2 mt-2">
          <span
            v-if="task.category"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :style="{ backgroundColor: task.category.color + '20', color: task.category.color }"
          >
            {{ task.category.name }}
          </span>
          <span
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            ]"
          >
            {{ task.priority }}
          </span>
          <span v-if="task.due_date" class="text-xs text-gray-500">
            Due: {{ new Date(task.due_date).toLocaleDateString() }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <button
        @click.stop="$emit('edit', task)"
        class="text-gray-400 hover:text-blue-600 text-sm"
        title="Edit"
      >
        ✏️
      </button>
      <button
        @click.stop="$emit('archive', task.id)"
        class="text-gray-400 hover:text-gray-600 text-sm"
        title="Archive"
      >
        📦
      </button>
      <button
        @click.stop="$emit('delete', task.id)"
        class="text-gray-400 hover:text-red-600 text-sm"
        title="Delete"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  }
})

defineEmits(['archive', 'delete', 'complete', 'edit'])
</script>

