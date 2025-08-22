import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { TaskResultOutput } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'

export const useTaskResultOutputStore = defineStore('taskResultOutput', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const taskResultOutputs = ref<Record<string, TaskResultOutput[]>>({})

  // getters
  const getTaskResultOutputsByTaskResultId = (taskResultId: string) => {
    return computed(() => taskResultOutputs.value[taskResultId] || [])
  }

  // actions
  const loadOutputsByTaskResultId = async (taskResultId: string) => {
    try {
      const outputs = await krabsSdk.taskResult.output.byTaskResultId(taskResultId).get()
      if (outputs) {
        taskResultOutputs.value[taskResultId] = outputs
      }
    } catch {
      console.error(`Failed to load outputs for taskResult: ${taskResultId}`)
    }
  }

  return {
    taskResultOutputs,
    loadOutputsByTaskResultId,
    getTaskResultOutputsByTaskResultId,
  }
})
