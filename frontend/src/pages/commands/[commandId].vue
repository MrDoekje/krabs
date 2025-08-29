<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Save } from 'lucide-vue-next'
import { useCommandStore } from '@/stores/command'
import { useRoute } from 'vue-router'
import type { Argument, CreateArgumentDto, UpdateCommandDto } from '@/krabs-sdk/models'
import { useArgumentStore } from '@/stores/argument'

const route = useRoute('/commands/[commandId]')
const commandId = route.params.commandId

const { loadCommand, getCommand, updateCommand } = useCommandStore()

const { createArgument } = useArgumentStore()

loadCommand(commandId)

const existingCommand = getCommand(commandId)
const command = reactive<UpdateCommandDto>({
  name: '',
  wd: '',
  command: '',
  format: '',
  optional: true,
  arguments: [],
})
watch(
  () => existingCommand.value,
  (updatedExistingCommand) => {
    if (updatedExistingCommand) {
      command.name = updatedExistingCommand!.name
      command.wd = updatedExistingCommand!.wd
      command.command = updatedExistingCommand!.command
      command.format = updatedExistingCommand!.format
      command.optional = updatedExistingCommand!.optional
      command.arguments = (updatedExistingCommand.arguments || [])
        .map((arg) => arg)
        .filter(Boolean) as Argument[]
    }
  },
  { immediate: true },
)
const isLoading = ref(false)

const handleSave = async () => {
  isLoading.value = true
  await updateCommand(commandId, command)

  isLoading.value = false
}
</script>

<template>
  <div class="container mx-auto p-6 flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Command Details</h1>
      <p class="text-muted-foreground mt-2">Inspect and edit command configuration</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <k-manage-command-info v-model:command="command" />
      </div>

      <div class="flex flex-col gap-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Arguments</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-y-6">
            <argument-list
              allow-edit
              v-model:arguments="command.arguments"
              :command-id="commandId"
            />
          </CardContent>
        </Card>
      </div>
    </div>
    <Button @click="handleSave" :disabled="isLoading" class="w-full">
      <div v-if="isLoading" class="flex items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
        Saving...
      </div>
      <div v-else class="flex items-center">
        <Save class="h-4 w-4 mr-2" />
        Save Changes
      </div>
    </Button>
  </div>
</template>
