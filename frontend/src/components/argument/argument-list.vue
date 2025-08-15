<template>
  <div v-if="argumentList.length > 0" class="flex flex-col gap-y-3">
    <k-argument-or-manage
      v-for="(arg, index) in argumentList"
      :key="index"
      :arg="arg"
      :allow-edit="allowEdit"
      @update:argument="(updatedArg) => updateArgs(updatedArg, index)"
      @remove="() => removeArg(index)"
      class="flex items-center justify-between p-3 border rounded-lg"
    />
  </div>
  <p v-else class="text-muted-foreground text-sm text-center py-4">No arguments defined</p>
</template>

<script setup lang="ts">
import type { Argument } from '@/krabs-sdk/models'

const argumentList = defineModel<Argument[]>('arguments', {
  default: [],
})

const updateArgs = (updatedArg: Argument, index: number) => {
  argumentList.value[index] = { ...updatedArg }
}

const removeArg = (index: number) => {
  argumentList.value.splice(index, 1)
}

defineProps<{
  allowEdit?: boolean
}>()
</script>

<style scoped></style>
