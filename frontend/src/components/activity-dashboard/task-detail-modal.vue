<script lang="ts" setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import StatusBadge from './status-badge.vue'
import { Calendar, Terminal } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  taskResult: {
    type: Object,
    default: null,
  },
  open: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:open'])

const onOpenChange = (value: boolean) => {
  emit('update:open', value)
}

const mockLogOutput = computed(() => {
  if (!props.taskResult) return ''
  const createdAt = new Date(props.taskResult.createdAt).toISOString()
  const taskName = props.taskResult.task.name

  const successLog = `[${createdAt}] Task completed successfully
[${createdAt}] Cleaning up resources...
[${createdAt}] Task finished with status: SUCCESS`

  const failureLog = `[${createdAt}] Error encountered during execution
[${createdAt}] Error: Task failed due to timeout
[${createdAt}] Stack trace: ...
[${createdAt}] Task finished with status: FAILURE`

  return `[${createdAt}] Starting task: ${taskName}
[${createdAt}] Initializing task environment...
[${createdAt}] Processing task parameters...
[${createdAt}] Executing main task logic...
${props.taskResult.success ? successLog : failureLog}`
})

const formatTimestamp = (dateString) => {
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent v-if="taskResult" class="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle class="flex items-center flex gap-2">
          <Terminal class="h-5 w-5" />
          Task Execution Details
        </DialogTitle>
        <DialogDescription> Full execution log and details for task run </DialogDescription>
      </DialogHeader>

      <div class="flex gap-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div class="flex gap-y-1">
            <p class="text-sm font-medium text-muted-foreground">Task Name</p>
            <p class="font-semibold">{{ taskResult.task.name }}</p>
          </div>
          <div class="flex gap-y-1">
            <p class="text-sm font-medium text-muted-foreground">Status</p>
            <StatusBadge :success="taskResult.success" />
          </div>
          <div class="flex gap-y-1">
            <p class="text-sm font-medium text-muted-foreground">Executed At</p>
            <div class="flex items-center flex gap-1 text-sm">
              <Calendar class="h-4 w-4" />
              {{ formatTimestamp(taskResult.createdAt) }}
            </div>
          </div>
        </div>

        <div class="flex gap-y-2">
          <div class="flex items-center flex gap-2">
            <h3 class="text-lg font-semibold">Execution Log</h3>
            <Badge variant="outline" class="text-xs"> ID: {{ taskResult.id }} </Badge>
          </div>
          <ScrollArea class="h-[300px] w-full rounded-md border p-4">
            <pre class="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
              {{ mockLogOutput }}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
