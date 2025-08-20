<template>
  <Card class="bg-muted/60">
    <CardHeader>
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <Terminal class="h-5 w-5 text-primary" />
          <CardTitle class="text-xl">{{ command.name }}</CardTitle>
          <Badge v-if="command.optional" variant="secondary">Optional</Badge>
        </div>
        <div class="ml-auto flex flex-row gap-2">
          <slot name="actions" />
        </div>
      </div>
      <CardDescription v-if="command.id" class="flex items-center gap-1">
        <Hash class="h-3 w-3" />
        ID: {{ command.id }}
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1" v-if="command.command">
          <div class="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Terminal class="h-3 w-3" />
            Command
          </div>
          <code class="block p-2 bg-muted/60 rounded text-sm font-mono">{{ command.command }}</code>
        </div>

        <div class="space-y-1" v-if="command.format">
          <div class="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <FileText class="h-3 w-3" />
            Format
          </div>
          <Badge variant="outline">{{ command.format }}</Badge>
        </div>

        <div class="space-y-1" v-if="command.wd">
          <div class="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Folder class="h-3 w-3" />
            Working Directory
          </div>
          <code class="block p-2 bg-muted/60 break-all rounded text-sm font-mono">{{
            command.wd
          }}</code>
        </div>
      </div>

      <template v-if="command.arguments && command.arguments.length > 0">
        <Separator />
        <div class="space-y-3">
          <div class="flex items-center gap-1 text-sm font-medium">
            <Settings class="h-4 w-4" />
            Arguments ({{ command.arguments.length }})
          </div>
          <argument-list
            :allow-edit="allowEdit"
            v-model:arguments="command.arguments"
            :command-id="command.id"
          />
        </div>
      </template>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { Command } from '@/krabs-sdk/models'
import { FileText, Folder, Hash, Settings, Terminal } from 'lucide-vue-next'

const command = defineModel<Command>('command', {
  required: true,
})

defineProps<{
  allowEdit?: boolean
}>()
</script>
