<script lang="ts" setup>
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  taskResult: {
    type: Object,
    default: () => ({
      task: { name: 'Data Processing Pipeline' },
      output:
        'Successfully processed 1,247 records\nGenerated report: monthly_analytics.pdf\nExecution time: 2.3 seconds\nMemory usage: 45.2 MB\nAll validation checks passed\nOutput files saved to /exports/2024-01/',
      error: '',
      success: true,
      createdAt: '2024-01-15T14:30:25Z',
    }),
  },
})

const emit = defineEmits(['back'])

const onBack = () => {
  emit('back')
}

const formatTimestamp = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-4xl mx-auto flex flex-col gap-y-6">
      <div class="flex items-center flex gap-4">
        <Button variant="ghost" size="sm" @click="onBack" class="flex items-center flex gap-2">
          <ArrowLeft class="h-4 w-4" />
          Back
        </Button>
        <h1 class="text-2xl font-bold text-gray-900">Task Execution Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex gap-y-2">
              <CardTitle class="text-xl">{{ taskResult.task.name }}</CardTitle>
              <div class="flex items-center flex gap-4">
                <div class="flex items-center flex gap-2">
                  <template v-if="taskResult.success">
                    <CheckCircle class="h-5 w-5 text-green-600" />
                    <Badge variant="secondary" class="bg-green-100 text-green-800 border-green-200">
                      Success
                    </Badge>
                  </template>
                  <template v-else>
                    <XCircle class="h-5 w-5 text-red-600" />
                    <Badge variant="secondary" class="bg-red-100 text-red-800 border-red-200">
                      Failure
                    </Badge>
                  </template>
                </div>
                <div class="flex items-center flex gap-2 text-sm text-gray-600">
                  <Clock class="h-4 w-4" />
                  {{ formatTimestamp(taskResult.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center flex gap-2">
            <template v-if="taskResult.success">
              <CheckCircle class="h-5 w-5 text-green-600" />
              Output
            </template>
            <template v-else>
              <XCircle class="h-5 w-5 text-red-600" />
              Error
            </template>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative">
            <pre
              :class="[
                'p-4 rounded-lg border text-sm font-mono whitespace-pre-wrap overflow-x-auto',
                taskResult.success
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              ]"
            >
              {{ taskResult.success ? taskResult.output : taskResult.error }}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div class="flex justify-between items-center pt-4">
        <Button variant="outline" @click="onBack">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to Activity List
        </Button>
        <div class="flex flex gap-2">
          <Button variant="outline" size="sm">Copy Log</Button>
          <Button variant="outline" size="sm">Download</Button>
        </div>
      </div>
    </div>
  </div>
</template>