<template>
  <Card>
    <CardHeader>
      <CardTitle class="h3">
        {{ taskResult.task?.name || taskResult.id }}
      </CardTitle>
      <CardDescription class="flex flex-col gap-2" v-if="taskResult.updatedAt">
        {{ new Date(taskResult.updatedAt).toLocaleString() }}
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
      </CardDescription>
    </CardHeader>
    <CardContent class="px-0">
      <div
        class="flex flex-col overflow-auto gap-4"
        v-if="taskResult.taskRun?.commandArguments?.additionalData"
      >
        <template
          v-for="(commandArguments, commandName) in taskResult.taskRun.commandArguments
            .additionalData"
          :key="commandName"
        >
          <Separator />
          <div class="w-full flex flex-col gap-2 px-6">
            <div class="flex items-center flex-row gap-2 h4">
              <TerminalIcon class="size-4" />
              {{ commandName }}
            </div>
            <div class="flex flex-col gap-2">
              <div class="bg-muted/60 rounded-xl p-2 border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[6rem]">Argument</TableHead>
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
                      <TableCell class="!text-wrap">
                        {{ argumentValue }}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </template>
      </div>
    </CardContent>
    <CardFooter class="flex flex-row self-end gap-2">
      <slot name="actions" />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import type { TaskResult } from '@/krabs-sdk/models'
import { statusMap } from '@/stores/activity/types'
import { TerminalIcon } from 'lucide-vue-next'
defineProps<{
  taskResult: TaskResult
}>()
</script>

<style scoped></style>
