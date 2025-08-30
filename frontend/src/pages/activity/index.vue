<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import { Clock, List, TerminalIcon } from 'lucide-vue-next'
import type { TaskResult } from '@/krabs-sdk/models'

const {
  getTaskResultList,
  getQueuedTasks,
  loadTaskResults,
  loadQueuedTasks,
  listenToQueueEvents,
  clearQueue,
  stopQueuedTask,
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
</script>

<template>
  <div class="w-full py-6 mx-auto space-y-6">
    <header class="px-6">
      <h1>Activity</h1>
      <p>Monitor your running and completed tasks.</p>
    </header>
    <Separator />
    <div class="px-6 flex flex-col gap-y-6">
      <div>
        <div class="flex items-center gap-2">
          <Clock class="size-6" />
          <h2>Running Tasks</h2>
        </div>
        <p>Tasks that are currently in progress or waiting to be executed.</p>
      </div>
      <div class="flex flex-col gap-3">
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
      </div>
    </div>
    <Separator />
    <div class="px-6 flex flex-col gap-y-6">
      <div>
        <div class="flex items-center gap-2">
          <List class="size-6" />
          <h2>Queued Tasks</h2>
          <Button
            variant="destructive"
            size="sm"
            class="ml-auto"
            @click="clearQueue"
            :disabled="queuedTasks.length === 0"
          >
            Clear Queue
          </Button>
        </div>
        <CardDescription>Tasks waiting to be executed.</CardDescription>
      </div>
      <div>
        <div v-if="queuedTasks.length === 0" class="text-sm text-center text-muted-foreground py-4">
          No completed tasks found.
        </div>
        <div class="flex flex-col gap-3">
          <k-task-result
            :task-result="taskResult"
            v-for="(taskResult, index) in queuedTasks"
            :key="taskResult.id || index"
          >
            <template #actions>
              <Button @click="stopQueuedTask(taskResult.id)" variant="destructive" size="sm"
                >Remove from queue</Button
              >
            </template>
          </k-task-result>
        </div>
      </div>
    </div>
  </div>
</template>
