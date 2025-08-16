<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { ChevronsUpDown, Play, Plus, CheckCircle, XCircle, Loader2, Edit } from 'lucide-vue-next'
import { useTasksStore } from '@/stores/tasks'
import { useRoute } from 'vue-router'

const { id } = useRoute('/tasks/[id]/').params

const { getTask, loadTask, queueTask, executeTask } = useTasksStore()

const task = getTask(id)

onMounted(async () => {
  await loadTask(id)
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

const activeTab = ref('configuration')
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

const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString()

const executeCollapsibleIsOpen = ref(false)
const commandArguments = ref<Record<string, Record<string, string>>>({})
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="flex flex-col gap-y-6">
      <Card v-if="task">
        <CardHeader>
          <div class="flex flex-col gap-y-2">
            <div class="flex flex-row justify-between">
              <CardTitle class="text-2xl">{{ task.name }}</CardTitle>

              <router-link
                v-if="task.id"
                :to="{
                  name: '/tasks/[id]/edit',
                  params: { id: task.id },
                }"
              >
                <Button variant="link"> Edit </Button>
              </router-link>
            </div>
            <CardDescription class="text-base max-w-3xl">
              {{ task.description }}
            </CardDescription>

            <Collapsible v-model:open="executeCollapsibleIsOpen" class="w-full space-y-2">
              <div class="flex items-center justify-between">
                <CollapsibleTrigger as-child>
                  <Button variant="ghost" size="sm" class="">
                    <h4 class="text-sm font-semibold">Run Task</h4>

                    <ChevronsUpDown class="h-4 w-4" />
                    <span class="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent class="space-y-2">
                <form class="flex flex-col gap-4" @submit.prevent="handleExecuteNow">
                  <div
                    v-for="command in task?.taskCommands || []"
                    :key="command.id"
                    class="flex flex-col gap-2 border rounded-md p-3"
                  >
                    <div class="font-medium">{{ command.command?.name }}</div>
                    <div
                      class="flex flex-col gap-2"
                      v-if="command.command?.arguments && command.command.arguments.length"
                    >
                      <template v-for="argument in command.command.arguments || []">
                        <div
                          :key="argument.id"
                          v-if="command.command.name != null && argument.name != null"
                          class="flex gap-2"
                        >
                          <Label
                            :for="`${command.command.name}-${argument.name}`"
                            class="text-sm min-w-[120px] capitalize"
                          >
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
                      </template>
                    </div>
                  </div>
                  <div class="flex gap-3 ml-auto">
                    <Button type="submit" :disabled="isExecuting" class="flex gap-2">
                      <Loader2 v-if="isExecuting" class="h-4 w-4 animate-spin" />
                      <Play v-else class="h-4 w-4" />
                      {{ isExecuting ? 'Executing...' : 'Execute Now' }}
                    </Button>
                    <Button
                      variant="outline"
                      @click="handleAddToQueue"
                      class="flex gap-2"
                      type="button"
                    >
                      <Plus class="h-4 w-4" />
                      Add to Queue
                    </Button>
                  </div>
                </form>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardHeader>
      </Card>

      <Tabs v-model="activeTab" class="flex flex-col gap-y-6">
        <TabsList class="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" class="flex flex-col gap-y-4" v-if="task">
          <Card>
            <CardHeader class="flex flex-col gap-y-2">
              <CardTitle>Task Commands</CardTitle>
              <CardDescription>
                Commands that will be executed in order when this task runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex flex-col gap-y-4">
                <k-command
                  v-for="command in task.taskCommands"
                  :command="command.command"
                  :key="command.id"
                  allow-edit
                >
                  <template #actions>
                    <router-link
                      :to="{
                        name: '/commands/[id]',
                        params: { id: command.command?.id },
                      }"
                    >
                      <Button variant="ghost" size="icon" aria-label="Edit Command">
                        <Edit />
                      </Button>
                    </router-link>
                  </template>
                </k-command>
              </div>
            </CardContent>
          </Card>
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
                        v-if="result.success === true"
                        class="flex items-center gap-1 text-green-600"
                      >
                        <CheckCircle class="h-4 w-4" /> Success
                      </span>
                      <span
                        v-else-if="result.success === false"
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
                      <span
                        v-if="result.success === false && result.errorEscaped"
                        class="text-red-600 text-sm"
                      >
                        {{ result.errorEscaped }}
                      </span>
                      <span v-else-if="result.output" class="text-gray-600 text-sm">
                        {{ result.output }}
                      </span>
                      <span v-else>-</span>
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
