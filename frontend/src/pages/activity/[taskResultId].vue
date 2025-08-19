<template>
  <div class="w-full p-6 mx-auto space-y-8">
    <header>
      <h1 class="text-3xl font-bold">Task Result</h1>
      <p class="text-muted-foreground">View details and activity log for this task result.</p>
    </header>
    <Card v-if="taskResult">
      <CardHeader>
        <CardTitle>
          {{ taskResult.task?.name || taskResult.id }}
        </CardTitle>
        <CardDescription v-if="taskResult.createdAt">
          Started: {{ new Date(taskResult.createdAt).toLocaleString() }}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription> Last updated: {{ new Date().toLocaleTimeString() }} </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea class="h-96">
          <div class="font-mono text-sm">
            <div v-if="fullLog.length === 0" class="text-muted-foreground">
              No activity events to display.
            </div>
            <div
              v-for="(event, index) in fullLog"
              :key="index"
              class="flex items-start gap-4 p-2 border-b border-border/50"
            >
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
              <template
                v-else-if="typeof event === 'object' && event !== null && Array.isArray(event.data)"
              >
                <span class="flex-grow">
                  <pre class="whitespace-pre-wrap">{{ JSON.stringify(event.data, null, 2) }}</pre>
                </span>
              </template>
              <template
                v-else-if="
                  typeof event === 'object' && event !== null && 'output' in event && event.output
                "
              >
                <CheckCircle2
                  v-if="event.success"
                  class="w-4 h-4 text-green-500 mt-1 flex-shrink-0"
                />
                <XCircle v-else class="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                <span class="flex-grow">
                  <pre class="whitespace-pre-wrap">{{ event.output }}</pre>
                </span>
              </template>
              <!-- <template v-else>
                <span class="flex-grow text-muted-foreground">
                  {{ typeof event === 'object' ? JSON.stringify(event) : String(event) }}
                </span>
              </template> -->
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import { CheckCircle2, Clock, Loader, XCircle, Terminal, Info } from 'lucide-vue-next'
import type { TaskResult } from '@/krabs-sdk/models'
import { useTaskResultStore } from '@/stores/taskResult'
import { TaskResultStatus } from '@/stores/activity/types'

const route = useRoute('/activity/[taskResultId]')
const taskResultId = route.params.taskResultId as string

// TODO: fix naming
const { getTaskResultActivity, loadTaskResult } = useActivityStore()
const { getTaskResultById, loadResultById } = useTaskResultStore()

const eventSource = ref<EventSource | null>(null)
const taskResult = ref<TaskResult | null>(null)

const activityEvents = computed(() => {
  if (!taskResult.value?.id) return []
  return getTaskResultActivity(taskResult.value.id).value || []
})

const fullLog = computed(() => {
  const output = JSON.parse(taskResult.value?.output || '[]')
  return [...output, ...activityEvents.value]
})

onBeforeUnmount(() => {
  if (eventSource.value) {
    eventSource.value.close()
  }
})

const fetchTaskResult = async () => {
  eventSource.value = await loadTaskResult(taskResultId)
  await loadResultById(taskResultId)
  taskResult.value = getTaskResultById(taskResultId).value
}

onMounted(async () => {
  await fetchTaskResult()
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
