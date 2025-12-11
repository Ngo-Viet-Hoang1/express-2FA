import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface ApiState<TData> {
  data: TData | null
  loading: boolean
  error: Error | null
}

export const useApi = <TArgs extends unknown[] = [], TData = unknown>(
  apiFunc: (...args: TArgs) => Promise<TData>,
) => {
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const execute = useCallback(
    async (...args: TArgs): Promise<TData> => {
      if (abortControllerRef.current) abortControllerRef.current.abort()

      abortControllerRef.current = new AbortController()

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const result = await apiFunc(...args)

        if (isMountedRef.current) {
          setState({ data: result, loading: false, error: null })
        }

        return result
      } catch (err) {
        if (
          axios.isCancel(err) ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          console.log('Request aborted')
          return Promise.reject(err)
        }

        if (isMountedRef.current) {
          const error =
            err instanceof Error ? err : new Error('An unknown error occurred')
          setState((prev) => ({ ...prev, loading: false, error }))
        }

        throw err
      }
    },
    [apiFunc],
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
