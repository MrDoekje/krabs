import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CreateTaskDto, Task, UpdateTaskDto } from '@/krabs-sdk/models'
import { useKrabsSdk } from '@/lib/krabs-sdk'

export const useTasksStore = defineStore('tasks', () => {
  const krabsSdk = useKrabsSdk()

  // state
  const tasks = ref<Record<string, Task>>({})
  // getters
  const getTaskList = () => computed(() => Object.values(tasks.value))
  const getTask = (taskId: string) => computed(() => tasks.value[taskId])
  // actions
  const loadTasks = async () => {
    try {
      const loadedTasks = await krabsSdk.tasks.get()
      loadedTasks?.forEach((task) => {
        if (!task.id) {
          console.error(`loaded task does not have id`)
          return
        }
        tasks.value[task.id] = task
      })
    } catch {
      console.error('failed to load tasks')
    }
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
    try {
      const updatedTask = await krabsSdk.tasks.byId(taskId).put(task)
      if (updatedTask != undefined && updatedTask.id) {
        tasks.value[updatedTask.id] = updatedTask
      }
    } catch {
      console.error('could not update task')
    }
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
