<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Plus, X, ChevronUp, ChevronDown, Terminal } from 'lucide-vue-next'
import { useTasksStore } from '@/stores/tasks'
import type { Command, CreateCommandDto } from '@/krabs-sdk/models'
import { useRouter } from 'vue-router'

const { createTask } = useTasksStore()
const router = useRouter()

const taskName = ref('')
const description = ref('')
const selectedCommands = ref<CreateCommandDto[]>([])

const isFormValid = computed(
  () => taskName.value.trim() !== '' && selectedCommands.value.length > 0,
)

const handleRemoveCommand = (index: number) => {
  selectedCommands.value.splice(index, 1)
}

const handleMoveCommand = (index: number, direction: 'up' | 'down') => {
  const newCommands = [...selectedCommands.value]
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex >= 0 && targetIndex < newCommands.length) {
    ;[newCommands[index], newCommands[targetIndex]] = [newCommands[targetIndex], newCommands[index]]
    selectedCommands.value = newCommands
  }
}

const handleCreateTask = async () => {
  const taskData = {
    name: taskName.value,
    description: description.value,
    commands: selectedCommands.value,
  }
  try {
    await createTask(taskData)
    router.push({
      name: '/tasks/',
    })
  } catch {}
}

const baseNewCommand: Command = {
  name: '',
  wd: '',
  command: '',
  format: '',
  optional: true,
  arguments: [],
}

const newCommand = ref(structuredClone(baseNewCommand))
const addArgument = () => {
  newCommand.value.arguments?.push({
    name: '',
    required: false,
  })
}

const removeArgument = (idx: number) => {
  newCommand.value.arguments?.splice(idx, 1)
}

const addNewCommand = () => {
  if (!newCommand.value.name || !newCommand.value.wd || !newCommand.value.command) return
  selectedCommands.value.push({
    // shallow copy to avoid reference issues
    ...newCommand.value,
    arguments: newCommand.value.arguments?.map((arg) => ({
      name: arg.name,
      required: arg.required,
    })),
  })
  newCommand.value = structuredClone(baseNewCommand)
}
</script>

<template>
  <div class="mx-auto p-6 flex flex-col gap-y-6">
    <div class="flex flex-col gap-y-1">
      <h1 class="text-3xl font-bold">Create New Task</h1>
      <p class="text-muted-foreground">
        Define a new task with commands that will be executed in sequence.
      </p>
    </div>

    <Card>
      <CardHeader><CardTitle>Task Details</CardTitle></CardHeader>
      <CardContent class="flex flex-col gap-y-4">
        <div class="flex flex-col gap-y-2">
          <Label for="task-name">Task Name *</Label>
          <Input id="task-name" v-model="taskName" placeholder="Enter task name..." />
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="description"
            placeholder="Describe what this task does..."
            rows="3"
          />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Terminal class="h-5 w-5" />
          Commands
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-y-4">
        <div class="flex gap-2">
          <!-- Command creation form -->
          <div class="flex flex-col gap-2 border rounded-lg p-4 bg-muted/30 w-full">
            <div class="flex gap-2">
              <div class="flex-1 flex flex-col gap-1.5">
                <Label for="cmd-name">Name *</Label>
                <Input id="cmd-name" v-model="newCommand.name" placeholder="Command name" />
              </div>
              <div class="flex-1 flex flex-col gap-1.5">
                <Label for="cmd-wd">Working Directory *</Label>
                <Input id="cmd-wd" v-model="newCommand.wd" placeholder="/path/to/dir" />
              </div>
              <div class="flex-1 flex flex-col gap-1.5">
                <Label for="cmd-command">Command *</Label>
                <Input
                  id="cmd-command"
                  v-model="newCommand.command"
                  placeholder="e.g. npm run build"
                />
              </div>
            </div>
            <div class="flex gap-2 items-center">
              <div class="flex-1 flex flex-col gap-1.5">
                <Label for="cmd-format">Format</Label>
                <Input
                  id="cmd-format"
                  v-model="newCommand.format"
                  placeholder="--{{name}}={{value}}"
                />
              </div>
              <Label class="flex gap-1.5">
                <Switch v-model="newCommand.optional" />
                Optional
              </Label>
            </div>
            <!-- Arguments List -->
            <div class="flex flex-col gap-1.5">
              <Label>Arguments</Label>
              <div
                v-for="(arg, idx) in newCommand.arguments"
                :key="idx"
                class="flex gap-1.5 items-center"
              >
                <Input v-model="arg.name" placeholder="Argument name" class="w-40" />
                <Label class="flex items-center gap-1.5">
                  <Switch v-model="arg.required" />
                  Required
                </Label>
                <Button variant="ghost" size="sm" @click="removeArgument(idx)">
                  <X class="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" class="self-start" @click="addArgument">
                <Plus class="h-4 w-4 mr-1" /> Add Argument
              </Button>
            </div>
            <div class="flex justify-end mt-2">
              <Button
                size="sm"
                :disabled="!newCommand.name || !newCommand.wd || !newCommand.command"
                @click="addNewCommand"
              >
                <Plus class="h-4 w-4 mr-1" /> Add Custom Command
              </Button>
            </div>
          </div>
        </div>

        <div v-if="selectedCommands.length > 0" class="flex flex-col gap-y-2">
          <span>Added Commands ({{ selectedCommands.length }})</span>
          <div class="flex gap-y-2">
            <div
              v-for="(command, index) in selectedCommands"
              :key="`${command.name}-${index}`"
              class="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
            >
              <div class="flex flex-col gap-1 min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <Badge variant="secondary" class="text-xs">{{ index + 1 }}</Badge>
                  <span class="font-medium">{{ command.name }}</span>
                </div>
                <code class="text-sm text-muted-foreground bg-background px-2 py-1 rounded">{{
                  command.command
                }}</code>
                <span class="text-xs text-muted-foreground"
                  >Working directory: {{ command.wd }}</span
                >
              </div>
              <div class="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="handleMoveCommand(index, 'up')"
                  :disabled="index === 0"
                >
                  <ChevronUp class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="handleMoveCommand(index, 'down')"
                  :disabled="index === selectedCommands.length - 1"
                >
                  <ChevronDown class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="handleRemoveCommand(index)">
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-muted-foreground">
          <Terminal class="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No commands added yet</p>
          <p class="text-sm">Select a command from the dropdown above to get started</p>
        </div>
      </CardContent>
    </Card>

    <div class="flex justify-end">
      <Button @click="handleCreateTask" :disabled="!isFormValid" size="lg" class="min-w-[150px]"
        >Create Task</Button
      >
    </div>

    <div
      v-if="!isFormValid && (taskName.trim() !== '' || selectedCommands.length > 0)"
      class="text-sm text-muted-foreground text-center"
    >
      <span v-if="taskName.trim() === ''">Task name is required. </span>
      <span v-if="selectedCommands.length === 0">At least one command is required.</span>
    </div>
  </div>
</template>
