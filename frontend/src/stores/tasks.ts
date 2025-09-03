import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CreateTaskDto, Task, UpdateTaskDto } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'
import { createWithLoading, useWithLoading, type WithLoading } from '@/composables/withLoading'

export const useTasksStore = defineStore('tasks', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const tasks = ref<Record<string, Task>>({})
  const taskList = ref<WithLoading<Task[]>>(createWithLoading([]))

  // state: actions
  const createTaskState = ref<WithLoading<null>>(createWithLoading(null))

  // getters
  const getTaskList = () => computed(() => taskList.value)
  const getTask = (taskId: string) => computed(() => tasks.value[taskId])

  // actions
  const loadTasks = async () => {
    const { executeAction } = useWithLoading({
      state: taskList,
      action: async () => {
        try {
          const loadedTasks = await krabsSdk.tasks.get()
          loadedTasks?.forEach((task) => {
            if (!task.id) {
              console.error(`loaded task does not have id`)
              return
            }
            tasks.value[task.id] = task
          })
          return loadedTasks
        } catch {
          console.error('failed to load tasks')
        }
      },
    })
    await executeAction()
  }

  const loadTask = async (taskId: string) => {
    try {
      const loadedTask = await krabsSdk.tasks.byId(taskId).get()
      if (!loadedTask?.id) {
        console.error(`loaded task does not have id`)
        return
      }
      tasks.value[loadedTask.id] = loadedTask
    } catch {
      console.error('failed to load tasks')
    }
  }

  const createTask = async (task: CreateTaskDto) => {
    try {
      const createdTask = await krabsSdk.tasks.post(task)
      if (createdTask != undefined && createdTask.id) {
        tasks.value[createdTask.id] = createdTask
      }
    } catch {
      console.error('could not create task')
    }
  }

  const updateTask = async (taskId: string, task: UpdateTaskDto) => {
    const { executeAction } = useWithLoading({
      state: createTaskState,
      action: async () => {
        try {
          const updatedTask = await krabsSdk.tasks.byId(taskId).put(task)
          if (updatedTask != undefined && updatedTask.id) {
            tasks.value[updatedTask.id] = updatedTask
          }
        } catch {
          console.error('could not update task')
        }
      },
    })
    await executeAction()
  }

  const executeTask = async (
    taskId: string,
    executeArguments: Record<string, Record<string, unknown>>,
  ) => {
    try {
      await krabsSdk.tasks
        .byId(taskId)
        .execute.post({ commandArguments: { additionalData: executeArguments } })
    } catch {
      console.error('could not create task')
    }
  }

  const queueTask = async (
    taskId: string,
    executeArguments: Record<string, Record<string, unknown>>,
  ) => {
    try {
      await krabsSdk.tasks
        .byId(taskId)
        .queue.post({ commandArguments: { additionalData: executeArguments } })
    } catch {
      console.error('could not create task')
    }
  }

  const removeTask = async (taskId: string) => {
    try {
      await krabsSdk.tasks.byId(taskId).delete()
      delete tasks.value[taskId]
    } catch {
      console.error('could not remove task')
    }
  }

  return {
    tasks,
    taskList,
    createTaskState,
    getTask,
    getTaskList,
    loadTask,
    loadTasks,
    createTask,
    executeTask,
    queueTask,
    updateTask,
    removeTask,
  }
})
