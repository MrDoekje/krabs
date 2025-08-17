<template>
  <div>
    <Argument :arg="arg" v-if="!allowEdit" />
    <HoverCard v-else>
      <HoverCardTrigger as-child>
        <Argument :arg="arg" />
      </HoverCardTrigger>
      <HoverCardContent class="flex flex-col gap-y-4">
        <k-manage-argument v-model:argument="editArgument" />
        <div class="self-end flex flex-row gap-2">
          <Button @click="saveChanges">Save</Button>
          <Button variant="ghost" @click="doRemoveArgument">Remove</Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
</template>

<script setup lang="ts">
import type { Argument } from '@/krabs-sdk/models'
import { useArgumentStore } from '@/stores/argument'
import { ref } from 'vue'

const props = defineProps<{
  allowEdit?: boolean
  arg: Argument
}>()

const editArgument = ref<Argument>({
  ...props.arg,
})

const { updateArgument, removeArgument } = useArgumentStore()

const emit = defineEmits<{
  (e: 'update:argument', argument: Argument): void
  (e: 'remove'): void
}>()

const saveChanges = async () => {
  if (props.arg.id) {
    await updateArgument(props.arg.id, editArgument.value)
  }
  emit('update:argument', editArgument.value)
}

const doRemoveArgument = async () => {
  if (props.arg.id) {
    await removeArgument(props.arg.id)
  }
  emit('remove')
}
</script>

<style scoped></style>
