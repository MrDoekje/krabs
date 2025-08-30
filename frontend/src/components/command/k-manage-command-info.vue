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
        <div class="flex flex-col gap-y-2">
          <Label for="format" class="flex items-center gap-2">
            <Code class="h-4 w-4" />
            Format
          </Label>
          <template v-if="formats.length">
            <Popover v-model:open="showExistingFormats">
              <div class="relative w-full">
                <Input
                  id="format"
                  v-model="command.format"
                  placeholder="e.g., --{{name}}={{value}}"
                  class="pr-10"
                />
                <span class="absolute end-0 inset-y-0 flex items-center justify-center px-2">
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" class="size-6 p-0">
                      <ChevronDown class="size-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                </span>
              </div>
              <PopoverContent class="!p-0" align="end">
                <Command>
                  <CommandInput
                    id="format"
                    v-model="formatSearch"
                    placeholder="e.g., --{{name}}={{value}}"
                    autocomplete="off"
                  />
                  <CommandList v-if="showExistingFormats && filteredFormats.length">
                    <CommandEmpty>No format found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        v-for="format in filteredFormats"
                        :key="format"
                        :value="format"
                        @mousedown.prevent="selectFormat(format.format || '')"
                        class="flex flex-row gap-2"
                      >
                        {{ format.format }}
                        <Badge variant="secondary" class="ml-auto">
                          {{ format.count }}
                        </Badge>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </template>

          <template v-else>
            <Input id="format" v-model="command.format" placeholder="e.g., --{{name}}={{value}}" />
          </template>
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
</template>

<script setup lang="ts">
import type { Command } from '@/krabs-sdk/models'
import { useCommandStore } from '@/stores/command'
import { Save, FileText, Terminal, Folder, Code, ChevronDown } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

const { loadMostPopularFormats, getMostPopularFormats } = useCommandStore()

const formats = computed(() => getMostPopularFormats().value)
const showExistingFormats = ref(false)
const filteredFormats = computed(() =>
  formats.value.filter((format) => format.format?.includes(formatSearch.value)),
)
const selectFormat = (format: string) => {
  command.value.format = format
  showExistingFormats.value = false
}
const formatSearch = ref('')

onMounted(async () => {
  await loadMostPopularFormats()
})

const command = defineModel<Command>('command', {
  required: true,
})
</script>

<style scoped></style>
