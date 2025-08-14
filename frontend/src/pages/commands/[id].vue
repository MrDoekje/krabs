<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, FileText, Terminal, Folder, Code } from 'lucide-vue-next'

const mockCommand = {
  id: 'cmd_001',
  wd: '/home/user/projects/myapp',
  name: 'Build Application',
  command: 'npm run build',
  format: 'json',
  arguments: [
    { name: 'environment', required: true },
    { name: 'verbose', required: false },
    { name: 'output-dir', required: false },
    { name: 'config', required: true },
  ],
}

const command = ref(mockCommand)
const isLoading = ref(false)

const handleSave = async () => {
  isLoading.value = true
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  isLoading.value = false
  console.log('Saving command:', command.value)
}
</script>

<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Command Details</h1>
      <p class="text-muted-foreground mt-2">Inspect and edit command configuration</p>
    </div>

    <div class="grid flex gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center flex gap-2">
              <Terminal class="h-5 w-5" />
              Command Configuration
            </CardTitle>
            <CardDescription>Edit the command details and configuration</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-y-6">
            <div class="grid flex gap-4 sm:grid-cols-2">
              <div class="flex gap-y-2">
                <Label for="name" class="flex items-center flex gap-2">
                  <FileText class="h-4 w-4" />
                  Name
                </Label>
                <Input id="name" v-model="command.name" placeholder="Enter command name" />
              </div>
              <div class="flex gap-y-2">
                <Label for="format" class="flex items-center flex gap-2">
                  <Code class="h-4 w-4" />
                  Format
                </Label>
                <Input id="format" v-model="command.format" placeholder="e.g., json, xml, text" />
              </div>
            </div>

            <div class="flex gap-y-2">
              <Label for="command" class="flex items-center flex gap-2">
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

            <div class="flex gap-y-2">
              <Label for="wd" class="flex items-center flex gap-2">
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

            <div class="flex justify-end pt-4">
              <Button @click="handleSave" :disabled="isLoading" class="min-w-[120px]">
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
          </CardContent>
        </Card>
      </div>

      <div class="flex flex-col gap-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Command Info</CardTitle>
          </CardHeader>
          <CardContent class="flex gap-y-3">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">ID</Label>
              <p class="font-mono text-sm bg-muted px-2 py-1 rounded mt-1">{{ command.id }}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Arguments</CardTitle>
            <CardDescription>Read-only list of command arguments</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="command.arguments.length > 0" class="flex gap-y-3">
              <div
                v-for="(arg, index) in command.arguments"
                :key="index"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p class="font-medium font-mono text-sm">{{ arg.name }}</p>
                </div>
                <Badge :variant="arg.required ? 'default' : 'secondary'">
                  {{ arg.required ? 'Required' : 'Optional' }}
                </Badge>
              </div>
            </div>
            <p v-else class="text-muted-foreground text-sm text-center py-4">
              No arguments defined
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
