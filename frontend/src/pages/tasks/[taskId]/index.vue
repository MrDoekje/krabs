<script lang="ts" setup>
import { computed, onMounted, ref, toRefs } from 'vue'
import {
  Play,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Pencil,
  HourglassIcon,
} from 'lucide-vue-next'
import { useTasksStore } from '@/stores/tasks'
import { useRoute } from 'vue-router'
import { TaskResult_statusObject } from '@/krabs-sdk/models'
import { useTaskRunStore } from '@/stores/taskRun'

const { taskId: id } = useRoute('/tasks/[taskId]/').params
const { getTask, loadTask, queueTask, executeTask } = useTasksStore()
const { loadTaskRunsByTaskId, getTaskRunsByTaskId, executeTaskRun } = useTaskRunStore()
const task = getTask(id)

const taskRunsByTaskId = computed(() => getTaskRunsByTaskId(id).value)

onMounted(async () => {
  await loadTask(id)
  await loadTaskRunsByTaskId(id)

  if (task?.value.taskCommands) {
    const argsObj: Record<string, Record<string, string>> = {}
    for (const command of task.value.taskCommands) {
      if (command.command?.name) {
        argsObj[command.command.name] = {}
        if (command.command.arguments) {
          for (const arg of command.command.arguments) {
            if (arg.name) {
              argsObj[command.command.name][arg.name] = ''
            }
          }
        }
      }
    }
    commandArguments.value = argsObj
  }
})

const activeTab = ref('run')
const isExecuting = ref(false)

const handleExecuteNow = async () => {
  isExecuting.value = true
  await executeTask(id, commandArguments.value)
  isExecuting.value = false
}

const handleAddToQueue = async () => {
  isExecuting.value = true
  await queueTask(id, commandArguments.value)
  isExecuting.value = false
}

const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleString()

const commandArguments = ref<Record<string, Record<string, string>>>({})
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="flex flex-col gap-y-6" v-if="task">
      <div class="flex flex-row gap-2 justify-between">
        <div class="flex flex-col">
          <h1>{{ task.name }}</h1>
          <p>
            {{ task.description }}
          </p>
        </div>
        <router-link
          v-if="task.id"
          class="self-start"
          :to="{
            name: '/tasks/[taskId]/edit',
            params: { taskId: task.id },
          }"
        >
          <Button variant="ghost"> <Pencil></Pencil> </Button>
        </router-link>
      </div>

      <Tabs v-model="activeTab" class="flex flex-col gap-y-6">
        <TabsList class="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="run">Run</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>

        <TabsContent value="run" class="flex flex-col gap-y-4">
          <div class="flex flex-row overflow-auto gap-2">
            <Card
              class="shrink-0 min-w-xs max-w-md self-start"
              v-for="run in taskRunsByTaskId"
              :key="run.id"
            >
              <CardHeader>
                <CardTitle>
                  {{ run.name }}
                </CardTitle>
              </CardHeader>
              <CardContent class="max-h-40 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[6rem]">Argument</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody class="">
                    <template
                      v-for="(commandArgs, commandName) in run.commandArguments?.additionalData"
                    >
                      <TableRow>
                        <TableCell class="font-medium"> [{{ commandName }}]: </TableCell>
                      </TableRow>
                      <TableRow
                        v-for="(argumentValue, argumentName) in commandArgs"
                        :key="argumentName"
                      >
                        <TableCell class="font-medium">
                          {{ argumentName }}
                        </TableCell>
                        <TableCell class="!text-wrap max-h-4 overflow-auto">
                          {{ argumentValue }}
                        </TableCell>
                      </TableRow>
                    </template>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter class="flex flex-row gap-2 items-end self-end">
                <Button
                  @click="() => executeTaskRun(run.id, { queued: false })"
                  size="icon"
                  class="flex gap-2"
                >
                  <Play class="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  @click="() => executeTaskRun(run.id, { queued: true })"
                  size="icon"
                  class="flex gap-2"
                >
                  <HourglassIcon class="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          <form
            class="flex flex-col gap-4"
            @submit.prevent="handleExecuteNow"
            v-if="Object.entries(commandArguments).length > 0"
          >
            <Card>
              <CardHeader>
                <CardTitle>Run with arguments </CardTitle>
                <CardDescription>
                  <p>Specify the arguments for each command below</p>
                </CardDescription>
              </CardHeader>

              <CardContent class="flex flex-col flex-wrap gap-3">
                <template v-for="command in task?.taskCommands || []" :key="command.id">
                  <template v-if="command.command?.arguments && command.command.arguments.length">
                    <template v-for="argument in command.command.arguments || []">
                      <Card class="bg-muted/60">
                        <CardContent>
                          <div
                            :key="argument.id"
                            v-if="command.command.name != null && argument.name != null"
                            class="flex flex-row grow justify-between gap-2"
                          >
                            <Label
                              :for="`${command.command.name}-${argument.name}`"
                              class="capitalize"
                            >
                              <span class="font-mono text-xs">[{{ command.command?.name }}]</span>
                              {{ argument.name }}
                            </Label>
                            <Input
                              :id="`${command.command.name}-${argument.name}`"
                              type="text"
                              class="input input-bordered input-sm w-full max-w-xs"
                              v-model="commandArguments[command.command.name][argument.name]"
                              :placeholder="''"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </template>
                  </template>
                </template>
              </CardContent>
            </Card>

            <div class="flex gap-3 ml-auto">
              <Button type="submit" :disabled="isExecuting" class="flex gap-2">
                <Loader2 v-if="isExecuting" class="h-4 w-4 animate-spin" />
                <Play v-else class="h-4 w-4" />
                {{ isExecuting ? 'Executing...' : 'Execute Now' }}
              </Button>
              <Button variant="outline" @click="handleAddToQueue" class="flex gap-2" type="button">
                <Plus class="h-4 w-4" />
                Add to Queue
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="commands" class="flex flex-col gap-y-4" v-if="task">
          <div class="flex flex-col gap-y-4">
            <k-command-or-manage
              v-for="command in task.taskCommands"
              :command="command.command"
              :key="command.id"
              allow-edit
            >
              <template #actions>
                <router-link
                  :to="{
                    name: '/commands/[commandId]',
                    params: { commandId: command.command?.id },
                  }"
                >
                  <Button variant="ghost" size="icon" aria-label="Edit Command">
                    <Eye />
                  </Button>
                </router-link>
              </template>
            </k-command-or-manage>
          </div>
        </TabsContent>

        <TabsContent value="activity" class="flex flex-col gap-y-4">
          <Card>
            <CardHeader class="flex flex-col gap-y-2">
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                History of task executions with status and timing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="result in task.results" :key="result.id">
                    <TableCell>
                      <span
                        v-if="result.status === TaskResult_statusObject.SUCCESS"
                        class="flex items-center gap-1 text-green-600"
                      >
                        <CheckCircle class="h-4 w-4" /> Success
                      </span>
                      <span
                        v-else-if="result.status === TaskResult_statusObject.FAILED"
                        class="flex items-center gap-1 text-red-600"
                      >
                        <XCircle class="h-4 w-4" /> Failed
                      </span>
                      <span v-else class="text-gray-400">Unknown</span>
                    </TableCell>
                    <TableCell class="font-mono text-sm">
                      {{ result.updatedAt ? formatTimestamp(result.updatedAt) : '-' }}
                    </TableCell>
                    <TableCell class="max-w-md">
                      <span class="text-gray-600 text-sm">
                        {{ result.output }}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
