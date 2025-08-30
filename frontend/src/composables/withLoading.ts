import { unref, type MaybeRef } from 'vue'

// TODO: for pagination, extend, keep data as current page, but extend the state
export interface WithLoading<T> {
  loading: boolean
  data: T | null
  error: Error | null
}

export const useWithLoading = <T>(withLoading: MaybeRef<WithLoading<T>>) => {
  const state = unref(withLoading)

  const setLoading = (loading: boolean) => {
    state.loading = loading
  }

  const setData = (data: T | null) => {
    state.data = data
  }

  const setError = (error: Error | null) => {
    state.error = error
  }

  return {
    ...state,
    setLoading,
    setData,
    setError,
  }
}
