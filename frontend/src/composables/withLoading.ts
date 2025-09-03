import { computed, unref, type MaybeRef } from 'vue'

// TODO: for pagination, extend, keep data as current page, but extend the state
export interface WithLoading<T> {
  loading: boolean
  data: T
  error: Error | null
  hasLoadedOnce: boolean
}

export const createWithLoading = <T>(defaultData: T): WithLoading<T> => ({
  loading: false,
  data: defaultData,
  error: null,
  hasLoadedOnce: false,
})

export interface UseWithLoadingOptions<T> {
  state: MaybeRef<WithLoading<T>>
  action?: () => Promise<T>
}

export const useWithLoading = <T>(options: UseWithLoadingOptions<T>) => {
  const { action, state: stateRef } = options

  const state = unref(stateRef)

  const executeAction = async () => {
    if (!action) return

    state.loading = true
    state.error = null

    try {
      // TODO: create util for wrapper around promise with toasts
      state.data = await action()
      state.hasLoadedOnce = true
    } catch (error) {
      if (error instanceof Error) {
        state.error = error
      }
      state.error = new Error('An unknown error occurred')
    } finally {
      state.loading = false
    }
  }

  const data = computed(() => state.data)
  const loading = computed(() => state.loading)
  const error = computed(() => state.error)
  const hasLoadedOnce = computed(() => state.hasLoadedOnce)

  return {
    data,
    loading,
    error,
    hasLoadedOnce,
    executeAction,
  }
}
