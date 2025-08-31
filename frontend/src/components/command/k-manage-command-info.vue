<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 h2 w-full">
        <Terminal class="h-5 w-5" />
        Configuration
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
        <k-command-format v-model="command.format" />
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
</template>

<script setup lang="ts">
import type { Command } from '@/krabs-sdk/models'
import { FileText, Terminal, Folder, Code, ChevronDown } from 'lucide-vue-next'

const command = defineModel<Command>('command', {
  required: true,
})
</script>

<style scoped></style>
