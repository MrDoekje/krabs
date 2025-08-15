<template>
  <div class="w-full mx-auto p-6 space-y-8">
    <form @submit.prevent="doUpdateTask" class="space-y-6 flex flex-col">
      <FormField label="Task Name">
        <Input v-model="form.name" required />
      </FormField>
      <FormField label="Description">
        <Textarea v-model="form.description" />
      </FormField>
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
        <div class="space-y-2">
          <div
            v-for="(element, index) in form.commands"
            :key="element.id"
            class="flex items-center justify-between p-3 border rounded bg-background"
          >
            <div class="flex flex-col gap-1">
              <div class="font-medium">{{ element.name }}</div>
              <div class="text-xs text-muted-foreground">{{ element.command }}</div>
              <Card class="bg-muted/20 p-4" v-if="element.arguments && element.arguments.length">
                <argument-list :arguments="element.arguments" />
              </Card>
            </div>
            <div class="flex gap-2 self-start">
              <Button
                @click="goToCommand(element.id)"
                size="icon"
                variant="ghost"
                :aria-label="`Edit ${element.name}`"
              >
                <Edit />
              </Button>
              <Button
                @click="removeCommand(index)"
                size="icon"
                variant="ghost"
                :aria-label="`Remove ${element.name}`"
              >
                <Trash />
              </Button>
              <Button
                @click="moveCommand(index, index - 1)"
                size="icon"
                variant="ghost"
                :disabled="index === 0"
                :aria-label="`Move ${element.name} up`"
              >
                <ArrowUp />
              </Button>
              <Button
                @click="moveCommand(index, index + 1)"
                size="icon"
                variant="ghost"
                :disabled="index === (form?.commands || []).length - 1"
                :aria-label="`Move ${element.name} down`"
              >
                <ArrowDown />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Button type="submit" :loading="loading" class="w-full" v-if="isFormDirty"
        >Update Task</Button
      >
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Command, CreateCommandDto, UpdateTaskDto } from '@/krabs-sdk/models'
import { useCommandStore } from '@/stores/command'
import { useTasksStore } from '@/stores/tasks'
import { ArrowDown, ArrowUp, Edit, Trash } from 'lucide-vue-next'
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

const { loadTask, getTask, updateTask } = useTasksStore()
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
