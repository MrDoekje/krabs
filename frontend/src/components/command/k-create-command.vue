<script lang="ts" setup>
import { ref } from 'vue'
import { Parentheses, Plus, Variable, X } from 'lucide-vue-next'
import type { CreateArgumentDto, CreateCommandDto } from '@/krabs-sdk/models'

const emit = defineEmits<{
  (e: 'create', command: CreateCommandDto): void
}>()

const baseNewCommand = {
  name: '',
  wd: '',
  command: '',
  format: '',
  optional: true,
  arguments: [] as CreateArgumentDto[],
} satisfies CreateCommandDto

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
  emit('create', {
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
  <div class="flex flex-col gap-4 w-full max-h-[80vh] overflow-auto">
    <div class="overflow-auto flex flex-col gap-4">
      <k-manage-command-info v-model:command="newCommand" />
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Variable class="h-4 w-4" />
            Arguments
          </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div
            v-for="(arg, idx) in newCommand.arguments"
            :key="idx"
            class="flex gap-4 items-center"
          >
            <k-manage-argument v-model:argument="newCommand.arguments[idx]" class="flex-1" />
            <Button variant="ghost" size="sm" @click="removeArgument(idx)">
              <X class="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" class="self-start" @click="addArgument">
            <Plus class="h-4 w-4 mr-1" /> Add Argument
          </Button>
        </CardContent>
      </Card>
    </div>

    <div class="flex justify-end">
      <slot
        name="actions"
        :disabled-add="!newCommand.name || !newCommand.wd || !newCommand.command"
        :add-new="addNewCommand"
      >
        <Button
          size="sm"
          :disabled="!newCommand.name || !newCommand.wd || !newCommand.command"
          @click="addNewCommand"
        >
          <Plus class="h-4 w-4 mr-1" /> Add Command
        </Button>
      </slot>
    </div>
  </div>
</template>
