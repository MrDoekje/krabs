<template>
  <Card class="bg-muted/60">
    <CardHeader>
      <CardTitle>
        {{ taskResult.task?.name || taskResult.id }}
      </CardTitle>
      <CardDescription v-if="taskResult.createdAt">
        Started: {{ new Date(taskResult.createdAt).toLocaleString() }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-row gap-2" v-if="taskResult.taskRun?.commandArguments?.additionalData">
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
    <CardFooter class="flex flex-row self-end gap-2">
      <Badge :variant="statusMap[taskResult.status].variant" class="gap-1" v-if="taskResult.status">
        <component
          :is="statusMap[taskResult.status].icon"
          class="w-3 h-3"
          :class="{ 'animate-spin': taskResult.status === 'IN_PROGRESS' }"
        />
        {{ statusMap[taskResult.status].text }}
      </Badge>
      <slot name="actions" />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import type { TaskResult } from '@/krabs-sdk/models'
import { statusMap } from '@/stores/activity/types'
defineProps<{
  taskResult: TaskResult
}>()
</script>

<style scoped></style>
