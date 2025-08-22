<template>
  <div class="w-full p-6 mx-auto space-y-8" :key="taskResultId">
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
        <div
          class="flex flex-row gap-2"
          v-if="taskResult.taskRun?.commandArguments?.additionalData"
        >
          <Card
            v-for="(commandArguments, commandName) in taskResult.taskRun.commandArguments
              .additionalData"
            :key="commandName"
            class="bg-muted/60"
          >
            <CardHeader>
              <CardTitle class="flex items-center flex-row gap-2">
                <TerminalIcon class="size-4" />
                {{ commandName }}
              </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
              <div class="bg-muted/60 rounded-xl p-2 border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[160px]">Argument</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="(argumentValue, argumentName) in commandArguments"
                      :key="argumentName"
                    >
                      <TableCell class="font-medium">
                        {{ argumentName }}
                      </TableCell>
                      <TableCell>
                        {{ argumentValue }}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>

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
              class="flex items-start gap-4 p-2 border-b border-border/50"
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
              class="flex items-start gap-4 p-2 border-b border-border/50"
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
