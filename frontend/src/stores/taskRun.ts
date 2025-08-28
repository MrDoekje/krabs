import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { TaskRun } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'

export const useTaskRunStore = defineStore('taskRun', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const taskRuns = ref<Record<string, TaskRun>>({})
  const favoritedTaskRuns = ref<Record<string, TaskRun>>({})
  const taskRunsByTaskId = ref<Record<string, TaskRun[]>>({})

  // getters
  const getAllTaskRuns = computed(() => Object.values(taskRuns.value))
  const getFavoritedTaskRuns = computed(() => Object.values(favoritedTaskRuns.value))
  const getTaskRunsByTaskId = (taskId: string) => {
    return computed(() => taskRunsByTaskId.value[taskId] || [])
  }
  const getTaskRunById = (id: string) => {
    return computed(() => taskRuns.value[id])
  }

  // actions
  const loadAllTaskRuns = async () => {
    try {
      const runs = await krabsSdk.task.run.get()
      runs?.forEach((run) => {
        if (run.id) {
          taskRuns.value[run.id] = run
        }
      })
    } catch (e) {
      console.error('Failed to load task runs', e)
    }
  }

  const loadFavoritedTaskRuns = async () => {
    try {
      const runs = await krabsSdk.task.run.favorites.get()
      runs?.forEach((run) => {
        if (run.id) {
          favoritedTaskRuns.value[run.id] = run
        }
      })
    } catch (e) {
      console.error('Failed to load favorited task runs', e)
    }
  }

  const loadTaskRunsByTaskId = async (taskId: string) => {
    try {
      const runs = await krabsSdk.task.byId(taskId).run.get()
      if (runs) {
        taskRunsByTaskId.value[taskId] = runs
      }
    } catch (e) {
      console.error(`Failed to load task runs for task ${taskId}`, e)
    }
  }

  //   const updateTaskRun = async (id: string, data: Partial<TaskRun>) => {
  //     try {
  //       const updated = await krabsSdk.task.run.byId(id).patch(data)
  //       if (updated && Array.isArray(updated)) {
  //         // Replace or add updated runs in taskRuns
  //         updated.forEach((run) => {
  //           const idx = taskRuns.value.findIndex((r) => r.id === run.id)
  //           if (idx !== -1) {
  //             taskRuns.value[idx] = run
  //           } else {
  //             taskRuns.value.push(run)
  //           }
  //         })
  //       }
  //     } catch (e) {
  //       console.error(`Failed to update task run: ${id}`, e)
  //     }
  //   }

  const executeTaskRun = async (id: string, dto: { queued?: boolean }) => {
    try {
      await krabsSdk.task.run.byId(id).execute.post(dto)
    } catch (e) {
      console.error(`Failed to execute task run: ${id}`, e)
    }
  }

  const toggleFavorite = async (id: string) => {
    try {
      const updated = await krabsSdk.task.run.byId(id).favorite.patch()
      if (updated) {
        if (updated.id) {
          taskRuns.value[updated.id] = updated
        }
        // Update in favoritedTaskRuns
        await loadFavoritedTaskRuns()
      }
    } catch (e) {
      console.error(`Failed to toggle favorite for task run: ${id}`, e)
    }
  }

  return {
    // state
    taskRuns,
    favoritedTaskRuns,
    taskRunsByTaskId,
    // getters
    getAllTaskRuns,
    getFavoritedTaskRuns,
    getTaskRunsByTaskId,
    getTaskRunById,
    // actions
    loadAllTaskRuns,
    loadFavoritedTaskRuns,
    loadTaskRunsByTaskId,
    // updateTaskRun,
    executeTaskRun,
    toggleFavorite,
  }
})
