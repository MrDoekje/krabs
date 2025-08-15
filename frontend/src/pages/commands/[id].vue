<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, FileText, Terminal, Folder, Code } from 'lucide-vue-next'
import { useCommandStore } from '@/stores/command'
import { useRoute } from 'vue-router'
import type { Argument, CreateArgumentDto, UpdateCommandDto } from '@/krabs-sdk/models'
import { useArgumentStore } from '@/stores/argument'

const route = useRoute('/commands/[id]')
const commandId = route.params.id

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

const baseNewArgument: CreateArgumentDto = {
  name: '',
  required: false,
  commandId,
}
const newArgument = ref<CreateArgumentDto>(structuredClone(baseNewArgument))

const resetNewArgument = () => {
  newArgument.value = structuredClone(baseNewArgument)
}

const createAndAddArgument = async () => {
  const createdArgument = await createArgument(newArgument.value)
  command?.arguments?.push(createdArgument)
  resetNewArgument()
}
</script>

<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Command Details</h1>
      <p class="text-muted-foreground mt-2">Inspect and edit command configuration</p>
    </div>

    <Card>
      <CardContent class="flex flex-col gap-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <Card class="bg-muted/20">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Terminal class="h-5 w-5" />
                  Command Configuration
                </CardTitle>
                <CardDescription>Edit the command details and configuration</CardDescription>
              </CardHeader>
              <CardContent class="flex flex-col gap-y-6">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="flex flex-col gap-y-2">
                    <Label for="name" class="flex items-center gap-2">
                      <FileText class="h-4 w-4" />
                      Name
                    </Label>
                    <Input id="name" v-model="command.name" placeholder="Enter command name" />
                  </div>
                  <div class="flex flex-col gap-y-2">
                    <Label for="format" class="flex items-center gap-2">
                      <Code class="h-4 w-4" />
                      Format
                    </Label>
                    <Input
                      id="format"
                      v-model="command.format"
                      placeholder="e.g., --{{name}}={{value}}"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-y-2">
                  <Label for="command" class="flex items-center gap-2">
                    <Terminal class="h-4 w-4" />
                    Command
                  </Label>
                  <Input
                    id="command"
                    v-model="command.command"
                    placeholder="Enter the command to execute"
                    class="font-mono"
                  />
                </div>

                <div class="flex flex-col gap-y-2">
                  <Label for="wd" class="flex items-center gap-2">
                    <Folder class="h-4 w-4" />
                    Working Directory
                  </Label>
                  <Textarea
                    id="wd"
                    v-model="command.wd"
                    placeholder="Enter the working directory path"
                    class="font-mono resize-none"
                    rows="2"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <Label for="optional" class="flex items-center gap-2">
                    <Switch id="optional" type="checkbox" v-model="command.optional" class="mr-2" />
                    Optional (will not block task on fail)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div class="flex flex-col gap-y-6">
            <Card class="bg-muted/20">
              <CardHeader>
                <CardTitle class="text-lg">Arguments</CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-y-6">
                <argument-list allow-edit :arguments="command.arguments" />
                <Dialog>
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
      </CardContent>
    </Card>
  </div>
</template>
