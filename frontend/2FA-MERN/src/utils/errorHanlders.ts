import { AxiosError } from 'axios'
import { type Path, type UseFormSetError } from 'react-hook-form'
import { toast } from 'sonner'

interface ApiError {
  errors?: Record<string, string>
  message?: string
}

export function handleApiError<T extends Record<string, any>>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError

    if (data?.errors) {
      Object.keys(data.errors).forEach((field) => {
        setError(field as Path<T>, {
          message: data.errors![field],
        })
      })
    }

    toast.error(data?.message ?? 'An error occurred. Please try again.')
  } else {
    toast.error('An unexpected error occurred. Please try again.')
  }
}
