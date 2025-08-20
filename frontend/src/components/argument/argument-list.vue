<template>
  <div class="flex flex-col gap-y-3">
    <template v-if="argumentList.length > 0">
      <k-argument-or-manage
        v-for="(arg, index) in argumentList"
        :key="index"
        :arg="arg"
        :allow-edit="allowEdit"
        @update:argument="(updatedArg) => updateArgs(updatedArg, index)"
        @remove="() => removeArg(index)"
      />
    </template>
    <p v-else class="text-muted-foreground text-sm text-center py-4">No arguments defined</p>

    <Dialog v-if="allowEdit">
      <DialogTrigger as-child>
        <Button variant="outline" size="sm">Add Argument</Button>
      </DialogTrigger>
      <DialogContent class="flex flex-col gap-6">
        <k-manage-argument v-model:argument="newArgument" />
        <DialogFooter>
          <DialogClose as-child>
            <Button @click="resetNewArgument" variant="secondary"> Cancel </Button>
          </DialogClose>
          <DialogClose as-child>
            <Button @click="createAndAddArgument"> Add Argument </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Argument, CreateArgumentDto } from '@/krabs-sdk/models'
import { useArgumentStore } from '@/stores/argument'
import { ref } from 'vue'

const props = defineProps<{
  allowEdit?: boolean
  commandId?: string | undefined | null
}>()

const emit = defineEmits<{
  (e: 'createAndAddArgument', argument: Argument): void
}>()

const { createArgument } = useArgumentStore()

const baseNewArgument: CreateArgumentDto = {
  name: '',
  required: false,
  commandId: props.commandId,
}

const newArgument = ref<CreateArgumentDto>(structuredClone(baseNewArgument))

const resetNewArgument = () => {
  newArgument.value = structuredClone(baseNewArgument)
}

const createAndAddArgument = async () => {
  if (newArgument.value?.name?.trim() === '') {
    return
  }
  if (props.commandId) {
    const createdArgument = await createArgument(newArgument.value)
    argumentList.value.push(createdArgument)
  } else {
    argumentList.value.push({
      ...newArgument.value,
    })
  }

  emit('createAndAddArgument', newArgument.value)
  resetNewArgument()
}

const argumentList = defineModel<Argument[]>('arguments', {
  default: [],
})

const updateArgs = (updatedArg: Argument, index: number) => {
  argumentList.value[index] = { ...updatedArg }
}
const removeArg = (index: number) => {
  argumentList.value.splice(index, 1)
}
</script>

<style scoped></style>
