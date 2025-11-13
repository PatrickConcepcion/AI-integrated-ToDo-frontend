import { toast } from 'vue3-toastify'

export const useToast = () => {
  const success = (message: string) => {
    toast.success(message, {
      icon: '✅'
    })
  }

  const error = (message: string) => {
    toast.error(message, {
      icon: '❌'
    })
  }

  const info = (message: string) => {
    toast.info(message, {
      icon: 'ℹ️'
    })
  }

  const warning = (message: string) => {
    toast.warning(message, {
      icon: '⚠️'
    })
  }

  return {
    success,
    error,
    info,
    warning
  }
}