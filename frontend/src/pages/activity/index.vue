<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import { statusMap } from '@/stores/activity/types'
import { Clock, List, TerminalIcon } from 'lucide-vue-next'
import type { TaskResult } from '@/krabs-sdk/models'

const { getTaskResultList, getQueuedTasks, loadTaskResults, loadQueuedTasks, listenToQueueEvents } =
  useActivityStore()

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
        <k-task-result
          :task-result="taskResult"
          v-for="(taskResult, index) in taskResultList"
          :key="taskResult.id || index"
        >
          <template #actions>
            <Button @click="openTaskDetails(taskResult)" variant="outline" size="sm"
              >View Activity</Button
            >
          </template>
        </k-task-result>
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
        <div class="flex flex-col gap-3">
          <k-task-result
            :task-result="taskResult"
            v-for="(taskResult, index) in queuedTasks"
            :key="taskResult.id || index"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
