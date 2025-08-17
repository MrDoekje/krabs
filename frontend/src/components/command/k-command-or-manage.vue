<template>
  <div>
    <k-command :command="command" v-if="!allowEdit">
      <template #actions>
        <slot name="actions" />
      </template>
    </k-command>
    <Dialog v-else>
      <k-command allow-edit :command="command">
        <template #actions>
          <DialogTrigger as-child>
            <Button variant="ghost">
              <Edit />
            </Button>
          </DialogTrigger>
          <slot name="actions" />
        </template>
      </k-command>
      <DialogContent class="flex flex-col gap-y-6">
        <k-manage-command-info v-model:command="editCommand" />
        <DialogFooter>
          <div class="self-end flex flex-row gap-4">
            <DialogClose as-child>
              <Button @click="saveChanges">Save</Button>
            </DialogClose>
            <DialogClose as-child>
              <Button variant="destructive" @click="doRemove">Remove</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Command } from '@/krabs-sdk/models'
import { useCommandStore } from '@/stores/command'
import { Edit } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  allowEdit?: boolean
  command: Command
}>()

const editCommand = ref<Command>({
  ...props.command,
})

const { updateCommand } = useCommandStore()

const emit = defineEmits<{
  (e: 'update:command', command: Command): void
  (e: 'remove'): void
}>()

const saveChanges = async () => {
  if (props.command.id) {
    await updateCommand(props.command.id, editCommand.value)
  }
  emit('update:command', editCommand.value)
}

const doRemove = async () => {
  emit('remove')
}
</script>
