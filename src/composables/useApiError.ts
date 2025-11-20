import type { Ref } from 'vue'
import { AxiosError } from 'axios'
import { useToast } from './useToast'

/**
 * Composable for handling API errors in a unified way
 *
 * Provides utilities for:
 * - Handling API errors with toast notifications
 * - Transforming backend validation errors for VeeValidate
 */
export function useApiError() {
  const { toastError } = useToast()

  /**
   * Handles API errors with standardized processing
   *
   * @param err - The error thrown by axios
   * @param errorRef - Reactive reference to store error message
   * @param fallbackMessage - Message to show if server doesn't provide one
   * @returns The extracted error message
   */
  const handleApiError = (
    err: unknown,
    errorRef: Ref<string | null>,
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

  /**
   * Transforms backend validation errors into a format compatible with VeeValidate
   *
   * @param error - The error object from axios
   * @returns Object mapping field names to error messages, or null if no validation errors exist
   */
  const transformValidationErrors = (
    error: any
  ): Record<string, string> | null => {
    const validationErrors = error?.response?.data?.errors
    if (!validationErrors) return null

    return Object.keys(validationErrors).reduce((acc, key) => {
      acc[key] = Array.isArray(validationErrors[key])
        ? validationErrors[key][0]
        : validationErrors[key]
      return acc
    }, {} as Record<string, string>)
  }

  return {
    handleApiError,
    transformValidationErrors
  }
}
