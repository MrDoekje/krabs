<template>
  <div class="w-full p-6 mx-auto">
    <Card>
      <CardContent class="space-y-6 flex flex-col">
        <Card class="bg-muted/30 border-0">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <BookCheck class="h-5 w-5" />
              Task information
            </CardTitle>
            <CardDescription>Edit the information of the task</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-y-6">
            <div class="flex flex-col gap-y-2">
              <Label for="name" class="flex items-center gap-2">
                <FileText class="h-4 w-4" />
                Name
              </Label>
              <Input id="name" placeholder="Enter task name" v-model="form.name" required />
            </div>
            <div class="flex flex-col gap-y-2">
              <Label for="description" class="flex items-center gap-2">
                <Text class="h-4 w-4" />
                Format
              </Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Additional information about this task"
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h2 class="font-semibold text-lg">Commands</h2>
            <Dialog>
              <DialogTrigger as-child>
                <Button @click="showAddCommand = true" variant="outline" size="sm"
                  >Add Command</Button
                >
              </DialogTrigger>
              <DialogContent>
                <k-create-command @create="onCommandCreated">
                  <template #actions="{ disabledAdd, addNew }">
                    <DialogFooter>
                      <DialogClose as-child>
                        <Button variant="secondary"> Cancel </Button>
                      </DialogClose>
                      <DialogClose as-child>
                        <Button :disabled="disabledAdd" @click="addNew"> Add Command </Button>
                      </DialogClose>
                    </DialogFooter>
                  </template>
                </k-create-command>
              </DialogContent>
            </Dialog>
          </div>
          <div class="space-y-2" v-if="form?.commands?.length">
            <k-command-or-manage
              v-for="(command, index) in form.commands"
              :key="command.id"
              v-model:command="form.commands[index]"
              allow-edit
            >
              <template #actions>
                <Button
                  @click="goToCommand(command.id)"
                  size="icon"
                  variant="ghost"
                  :aria-label="`Edit ${command.name}`"
                >
                  <Eye />
                </Button>

                <Button
                  @click="moveCommand(index, index - 1)"
                  size="icon"
                  variant="ghost"
                  :disabled="index === 0"
                  :aria-label="`Move ${command.name} up`"
                >
                  <ArrowUp />
                </Button>
                <Button
                  @click="moveCommand(index, index + 1)"
                  size="icon"
                  variant="ghost"
                  :disabled="index === (form?.commands || []).length - 1"
                  :aria-label="`Move ${command.name} down`"
                >
                  <ArrowDown />
                </Button>
                <Button
                  @click="removeCommand(index)"
                  size="icon"
                  variant="ghost"
                  :aria-label="`Remove ${command.name}`"
                >
                  <Trash />
                </Button>
              </template>
            </k-command-or-manage>
          </div>
        </div>
      </CardContent>
      <CardFooter class="justify-end">
        <Button @click="doUpdateTask" :loading="loading" class="grow" v-if="isFormDirty"
          >Update Task</Button
        >
        <Button variant="destructive" @click="doRemoveTask"> Delete </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { Command, CreateCommandDto, UpdateTaskDto } from '@/krabs-sdk/models'
import { useCommandStore } from '@/stores/command'
import { useTasksStore } from '@/stores/tasks'
import {
  ArrowDown,
  ArrowUp,
  BookCheck,
  Edit,
  Eye,
  FileText,
  Slash,
  Text,
  Trash,
} from 'lucide-vue-next'
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute('/tasks/[id]/edit')
const router = useRouter()
const id = route.params.id as string

const loading = ref(false)
const showAddCommand = ref(false)
const form = reactive<UpdateTaskDto>({
  name: '',
  description: '',
  commands: [],
})

const { loadTask, getTask, updateTask, removeTask } = useTasksStore()
const { createCommand } = useCommandStore()

loadTask(id)

const existingTask = getTask(id)

watch(
  () => existingTask.value,
  (task) => {
    if (task) {
      form.name = task!.name
      form.description = task!.description
      form.commands = (task.taskCommands || [])
        .map((cmd) => cmd.command)
        .filter(Boolean) as Command[]
    }
  },
  { immediate: true },
)

async function doUpdateTask() {
  loading.value = true
  try {
    await updateTask(id, {
      name: form.name,
      description: form.description,
      commands: form.commands,
    })
    router.push({
      name: '/tasks/[id]/',
      params: { id },
    })
  } finally {
    loading.value = false
  }
}

const doRemoveTask = async () => {
  await removeTask(id)
  router.push({
    name: '/tasks/',
  })
}

const isFormDirty = computed(() => {
  const task = existingTask.value
  if (!task) return false
  const commandsEqual =
    form.commands?.length === (task.taskCommands?.length || 0) &&
    form.commands.every((cmd, i) => cmd.id === task.taskCommands?.[i]?.command?.id)
  return form.name !== task.name || form.description !== task.description || !commandsEqual
})

function removeCommand(idx: number) {
  form.commands?.splice(idx, 1)
}

function goToCommand(commandId: string) {
  router.push({
    name: '/commands/[id]',
    params: { id: commandId },
  })
}

function moveCommand(from: number, to: number) {
  if (
    !form.commands ||
    from < 0 ||
    to < 0 ||
    from >= form.commands.length ||
    to >= form.commands.length
  ) {
    return
  }
  const [moved] = form.commands.splice(from, 1)
  form.commands.splice(to, 0, moved)
}

async function onCommandCreated(cmd: CreateCommandDto) {
  const created = await createCommand(cmd)
  form.commands?.push(created)
  showAddCommand.value = false
}
</script>
