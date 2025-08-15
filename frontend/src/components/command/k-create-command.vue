<script lang="ts" setup>
import { ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
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
        <Input id="cmd-command" v-model="newCommand.command" placeholder="e.g. npm run build" />
      </div>
    </div>
    <div class="flex gap-2 items-center">
      <div class="flex-1 flex flex-col gap-1.5">
        <Label for="cmd-format">Format</Label>
        <Input id="cmd-format" v-model="newCommand.format" placeholder="--{{name}}={{value}}" />
      </div>
      <Label class="flex gap-1.5">
        <Switch v-model="newCommand.optional" />
        Optional
      </Label>
    </div>
    <div class="flex flex-col gap-1.5">
      <Label>Arguments</Label>
      <div v-for="(arg, idx) in newCommand.arguments" :key="idx" class="flex gap-1.5 items-center">
        <k-manage-argument v-model:argument="newCommand.arguments[idx]" class="flex-1" />
        <Button variant="ghost" size="sm" @click="removeArgument(idx)">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <Button variant="outline" size="sm" class="self-start" @click="addArgument">
        <Plus class="h-4 w-4 mr-1" /> Add Argument
      </Button>
    </div>
    <slot
      name="actions"
      :disabled-add="!newCommand.name || !newCommand.wd || !newCommand.command"
      :add-new="addNewCommand"
    >
      <div class="flex justify-end mt-2">
        <Button
          size="sm"
          :disabled="!newCommand.name || !newCommand.wd || !newCommand.command"
          @click="addNewCommand"
        >
          <Plus class="h-4 w-4 mr-1" /> Add Custom Command
        </Button>
      </div>
    </slot>
  </div>
</template>
