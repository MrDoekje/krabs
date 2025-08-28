<template>
  <div class="w-full p-6 mx-auto space-y-8" :key="taskResultId">
    <header>
      <h1 class="text-3xl font-bold">Task Result</h1>
      <p class="text-muted-foreground">View details and activity log for this task result.</p>
    </header>
    <k-task-result :task-result="taskResult" v-if="taskResult" />

    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription> Last updated: {{ new Date().toLocaleTimeString() }} </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea class="h-96">
          <div class="font-mono text-sm">
            <div
              v-if="!activityEvents.length && !taskResultOutputs.length"
              class="text-muted-foreground"
            >
              No activity events to display.
            </div>
            <div
              v-for="(event, index) in taskResultOutputs"
              :key="index"
              class="flex items-start gap-4 p-2 border-b border-border"
            >
              <span
                class="text-xs text-muted-foreground whitespace-nowrap pt-1"
                v-if="event.createdAt"
              >
                [{{ event.createdAt.toLocaleTimeString() }}]
              </span>
              <Terminal class="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
              <code class="flex-grow whitespace-pre-wrap">{{ event.line }}</code>
            </div>
            <div
              v-for="(event, index) in activityEvents"
              :key="index"
              class="flex items-start gap-4 p-2 border-b border-border"
            >
              <!-- TODO: better v-if logic -->
              <span
                class="text-xs text-muted-foreground whitespace-nowrap pt-1"
                v-if="typeof event === 'object' && event !== null && 'timestamp' in event"
              >
                [{{ new Date(event.timestamp).toLocaleTimeString() }}]
              </span>
              <template
                v-if="
                  typeof event === 'object' &&
                  event !== null &&
                  'type' in event &&
                  event.type === 'output'
                "
              >
                <Terminal class="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <code class="flex-grow whitespace-pre-wrap">{{ event.data }}</code>
              </template>
              <template
                v-else-if="
                  typeof event === 'object' &&
                  event !== null &&
                  'type' in event &&
                  event.type === 'status'
                "
              >
                <Info class="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <span class="flex-grow font-semibold">Status changed to {{ event.data }}</span>
              </template>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import {
  CheckCircle2,
  Clock,
  Loader,
  XCircle,
  Terminal,
  Info,
  Slash,
  Code,
  TerminalIcon,
} from 'lucide-vue-next'
import type { TaskResult } from '@/krabs-sdk/models'
import { useTaskResultStore } from '@/stores/taskResult'
import { TaskResultStatus } from '@/stores/activity/types'
import { useTaskResultOutputStore } from '@/stores/taskResultOutput'

const route = useRoute('/activity/[taskResultId]')
// TODO: fix making this reactive
const taskResultId = route.params.taskResultId as string

// TODO: fix naming
const { getTaskResultActivity, loadTaskResult } = useActivityStore()
const { getTaskResultOutputsByTaskResultId, loadOutputsByTaskResultId } = useTaskResultOutputStore()
const { getTaskResultById, loadResultById } = useTaskResultStore()

const eventSource = ref<EventSource | null>(null)
const taskResult = ref<TaskResult | null>(null)

const activityEvents = computed(() => {
  if (!taskResult.value?.id) return []
  return getTaskResultActivity(taskResult.value.id).value || []
})

const taskResultOutputs = computed(() => {
  if (!taskResult.value?.id) return []
  return getTaskResultOutputsByTaskResultId(taskResult.value.id).value || []
})

const fetchTaskResult = async () => {
  eventSource.value = await loadTaskResult(taskResultId)
  await loadResultById(taskResultId)
  taskResult.value = getTaskResultById(taskResultId).value
  await loadOutputsByTaskResultId(taskResultId)
}

onMounted(async () => {
  await fetchTaskResult()
})

onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
})

watch(
  () => route.params.taskResultId,
  async (newId) => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
    await fetchTaskResult()
  },
)

// --- Mappers for UI ---
const statusMap = {
  [TaskResultStatus.SUCCESS]: { variant: 'outline', icon: CheckCircle2, text: 'Success' },
  [TaskResultStatus.IN_PROGRESS]: { variant: 'default', icon: Loader, text: 'In Progress' },
  [TaskResultStatus.FAILED]: { variant: 'destructive', icon: XCircle, text: 'Failed' },
  [TaskResultStatus.STOPPED]: { variant: 'secondary', icon: XCircle, text: 'Stopped' },
} as const
</script>
