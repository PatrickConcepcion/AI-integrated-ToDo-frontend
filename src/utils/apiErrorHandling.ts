import type { Ref } from 'vue'
import { AxiosError } from 'axios'

export const handleApiError = (
  err: unknown,
  errorRef: Ref<string | null>,
  toastError: (msg: string) => void,
  fallbackMessage: string
): string => {
  const errorMessage =
    err instanceof AxiosError && typeof err.response?.data?.message === 'string'
      ? err.response.data.message
      : fallbackMessage
  toastError(errorMessage)
  errorRef.value = errorMessage
  return errorMessage
}
