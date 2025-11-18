<template>
  <transition name="modal-fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      @click.self="handleClose"
    >
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
      <div
        ref="modalRef"
        class="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all"
        role="document"
      >
        <header class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 id="confirmation-title" class="text-lg font-semibold text-gray-900">
            <slot name="title">{{ actionTitle }}</slot>
          </h3>
          <button
            type="button"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-full"
            aria-label="Close dialog"
            @click="handleClose"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <section class="px-6 py-5 text-gray-700 text-base leading-relaxed">
          <slot>
            {{ message }}
          </slot>
        </section>

        <footer class="px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            class="w-full sm:w-auto inline-flex justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            @click="handleClose"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="loading"
            @click="handleConfirm"
          >
            <svg
              v-if="loading"
              class="w-4 h-4 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>{{ loading ? 'Working...' : confirmLabel }}</span>
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  actionTitle: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const modalRef = ref<HTMLElement | null>(null)
const focusableElements = ref<HTMLElement[]>([])

const close = () => {
  emit('update:modelValue', false)
}

const handleClose = () => {
  close()
}

const handleConfirm = () => {
  emit('confirm')
  nextTick(() => {
    if (!props.loading) {
      close()
    }
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.modelValue) return

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  } else if (event.key === 'Tab') {
    trapFocus(event)
  }
}

const trapFocus = (event: KeyboardEvent) => {
  const elements = focusableElements.value
  if (!elements.length) return

  const first = elements[0]
  const last = elements[elements.length - 1]
  const activeElement = document.activeElement as HTMLElement | null

  if (event.shiftKey) {
    if (activeElement === first || !activeElement) {
      event.preventDefault()
      last.focus()
    }
  } else if (activeElement === last || !activeElement) {
    event.preventDefault()
    first.focus()
  }
}

const updateFocusableElements = () => {
  const selectors =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  focusableElements.value = Array.from(
    modalRef.value?.querySelectorAll<HTMLElement>(selectors) ?? []
  )
}

const focusFirstElement = () => {
  nextTick(() => {
    updateFocusableElements()
    focusableElements.value[0]?.focus()
  })
}

watch(
  () => props.modelValue,
  value => {
    if (value) {
      document.addEventListener('keydown', handleKeydown)
      focusFirstElement()
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
