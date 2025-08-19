import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Task, TaskResult } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'
import type { ActivityDto, QueueDto } from './types'
import { toast } from 'vue-sonner'

export const useActivityStore = defineStore('activity', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const taskResults = ref<Record<string, TaskResult>>({})
  const taskResultActivity = ref<Record<string, ActivityDto[]>>({})
  const queuedTasks = ref<Task[]>([])

  // Listen to SSE for queue events and update the store in real-time
  const listenToQueueEvents = () => {
    // TODO: put event source in state, and add method to close
    const eventSource = new EventSource('/api/activity/queue-events')
    eventSource.onmessage = async ({ data }: { data: string }) => {
      try {
        const parsedData: QueueDto = JSON.parse(data)
        console.log(JSON.stringify(parsedData))
        switch (parsedData.event) {
          case 'queued': {
            // Add the task to the queue if not already present
            const relatedTask = await krabsSdk.tasks.byId(parsedData.taskId).get()
            if (relatedTask) {
              queuedTasks.value.push(relatedTask)
            }
            toast.success('Task queued')
            break
          }
          case 'started': {
            // Remove the task from the queue
            const idx = queuedTasks.value.findIndex((t) => t.id === parsedData.taskId)
            if (idx !== -1) {
              queuedTasks.value.splice(idx, 1)
            }
            const taskResult = await krabsSdk.taskResult
              .byTaskResultId(parsedData.taskResultId)
              .get()
            if (taskResult && taskResult.id) {
              taskResults.value[taskResult.id] = taskResult
            }
            toast.success('Task started')
            break
          }
          case 'ended': {
            // Remove the taskResult from taskResults
            if ('taskResultId' in parsedData) {
              delete taskResults.value[parsedData.taskResultId]
              toast.success('Task ended')
            }
            break
          }
        }
      } catch (e) {
        console.error('failed to parse queue event', e)
      }
    }
    eventSource.onerror = (err) => {
      console.error('SSE queue connection error', err)
      eventSource.close()
    }
    return eventSource
  }

  // getters
  const getTaskResultList = () => computed(() => Object.values(taskResults.value))
  const getTaskResultActivity = (taskResultId: string) =>
    computed(() => taskResultActivity.value[taskResultId] || [])
  const getQueuedTasks = computed(() => queuedTasks.value)
  const getTaskResult = (taskResultId: string) => computed(() => taskResults.value[taskResultId])

  // helpers
  const addOrInitiateTaskResultActivity = (activity: ActivityDto) => {
    if (!taskResultActivity.value[activity.id]) {
      taskResultActivity.value[activity.id] = []
    }
    taskResultActivity.value[activity.id].push(activity)
  }

  // actions
  const loadTaskResults = async () => {
    try {
      const loadedTaskResults = await krabsSdk.activity.taskResult.get()
      loadedTaskResults?.forEach((taskResult: TaskResult) => {
        if (!taskResult.id) {
          console.error('loaded taskResult does not have id')
          return
        }
        taskResults.value[taskResult.id] = taskResult
      })
    } catch {
      console.error('failed to load task results')
    }
  }

  // TODO: SSE event for when to remove an event from to queue into being an active task result

  // Listen to SSE for a specific taskResultId and update the store in real-time
  const loadTaskResult = (taskResultId: string) => {
    const eventSource = new EventSource(`/api/activity/task-result/${taskResultId}`)
    eventSource.onmessage = ({ data }: { data: string }) => {
      try {
        const parsedData: ActivityDto = JSON.parse(data)
        if (!parsedData?.id) {
          console.error('loaded taskResult does not have id')
          return
        }
        addOrInitiateTaskResultActivity(parsedData)
      } catch (e) {
        console.error('failed to parse task result', e)
      }
    }
    eventSource.onerror = (err) => {
      console.error('SSE connection error', err)
      eventSource.close()
    }

    // Optionally return the eventSource so the caller can close it when needed
    return eventSource
  }

  //   const stopTask = async (taskResultId: string) => {
  //     try {
  //       await krabsSdk.activity.taskResult.byId(taskResultId).delete()
  //       delete taskResults.value[taskResultId]
  //     } catch {
  //       console.error('failed to stop task')
  //     }
  //   }

  const loadQueuedTasks = async () => {
    // isLoadingQueuedTasks.value = true
    try {
      const tasks = await krabsSdk.activity.queue.get()
      queuedTasks.value.length = 0
      if (tasks) {
        queuedTasks.value.push(...tasks)
      }
    } catch (e) {
      console.error('failed to load queued tasks', e)
      queuedTasks.value = []
    }
  }

  return {
    taskResults,
    queuedTasks,
    getTaskResult,
    getTaskResultList,
    getTaskResultActivity,
    getQueuedTasks,
    loadTaskResults,
    loadTaskResult,
    loadQueuedTasks,
    listenToQueueEvents,
    // stopTask,
  }
})
