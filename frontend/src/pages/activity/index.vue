<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import { CheckCircle2, Clock, List, Loader, XCircle } from 'lucide-vue-next'
import type { TaskResult } from '@/krabs-sdk/models'
import { TaskResultStatus } from '@/stores/activity/types'

const {
  queuedTasks: queuedTasksState,
  taskResults,
  getTaskResultList,
  getQueuedTasks,
  loadTaskResults,
  loadQueuedTasks,
  listenToQueueEvents,
} = useActivityStore()

const router = useRouter()

const openTaskDetails = async (task: TaskResult) => {
  router.push(`/activity/${task.id}`)
}

const taskResultList = computed(() => getTaskResultList().value)
const queuedTasks = computed(() => getQueuedTasks)

onMounted(async () => {
  await loadTaskResults()
  await loadQueuedTasks()
  await listenToQueueEvents()
})

// --- Mappers for UI ---
const statusMap = {
  [TaskResultStatus.SUCCESS]: { variant: 'outline', icon: CheckCircle2, text: 'Success' },
  [TaskResultStatus.IN_PROGRESS]: { variant: 'default', icon: Loader, text: 'In Progress' },
  [TaskResultStatus.FAILED]: { variant: 'destructive', icon: XCircle, text: 'Failed' },
  [TaskResultStatus.STOPPED]: { variant: 'secondary', icon: XCircle, text: 'Stopped' },
} as const
</script>

<template>
  <div class="w-full p-6 mx-auto space-y-8">
    <header>
      <h1 class="text-3xl font-bold">Activity</h1>
      <p class="text-muted-foreground">Monitor your running and completed tasks.</p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          Running Tasks
        </CardTitle>
        <CardDescription>
          Tasks that are currently in progress or waiting to be executed.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <div
          v-if="taskResultList.length === 0"
          class="text-sm text-center text-muted-foreground py-4"
        >
          No active tasks.
        </div>
        <Card
          class="bg-muted/30 border-0"
          v-for="taskResult in taskResultList"
          :key="taskResult.id"
        >
          <CardHeader>
            <CardTitle>
              {{ taskResult.task?.name || taskResult.id }}
            </CardTitle>
            <CardDescription v-if="taskResult.createdAt">
              Started: {{ new Date(taskResult?.createdAt).toLocaleString() }}
            </CardDescription>
          </CardHeader>
          <CardFooter class="flex gap-4 ml-auto">
            <Badge
              :variant="statusMap[taskResult.status].variant"
              class="gap-1"
              v-if="taskResult.status"
            >
              <component
                :is="statusMap[taskResult.status].icon"
                class="w-3 h-3"
                :class="{ 'animate-spin': taskResult.status === 'IN_PROGRESS' }"
              />
              {{ statusMap[taskResult.status].text }}
            </Badge>
            <Button @click="openTaskDetails(taskResult)" variant="outline" size="sm"
              >View Activity</Button
            >
          </CardFooter>
        </Card>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <List class="w-5 h-5" />
          Queued Tasks
        </CardTitle>
        <CardDescription>Tasks waiting to be executed.</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="queuedTasks.length === 0" class="text-sm text-center text-muted-foreground py-4">
          No completed tasks found.
        </div>
        <Card v-for="task in queuedTasks" :key="task.id" class="bg-muted/30 border-0">
          <CardHeader>
            <CardTitle>
              {{ task.name || task.id }}
            </CardTitle>
            <CardDescription v-if="task.createdAt">
              Queued: {{ new Date(task.createdAt).toLocaleString() }}
            </CardDescription>
          </CardHeader>
          <CardFooter class="flex gap-4 ml-auto">
            <Button @click="openTaskDetails(task)" variant="outline" size="sm">View Log</Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  </div>
</template>
