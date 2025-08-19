import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { TaskResult } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'

export const useTaskResultStore = defineStore('taskResult', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const taskResults = ref<Record<string, TaskResult>>({})

  // getters
  const getTaskResultById = (taskResultId: string) => {
    return computed(() => taskResults.value[taskResultId] || [])
  }

  // actions
  const loadResultById = async (taskResultId: string) => {
    try {
      const result = await krabsSdk.taskResult.byTaskResultId(taskResultId).get()
      if (result) {
        taskResults.value[taskResultId] = result
      }
    } catch {
      console.error(`Failed to load results for task: ${taskResultId}`)
    }
  }

  return {
    taskResults,
    loadResultById,
    getTaskResultById,
  }
})
