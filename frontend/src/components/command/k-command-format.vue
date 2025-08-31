<template>
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
            v-model="format"
            placeholder="e.g., --{{name}}={{value}}"
            class="pr-10"
          />
          <span class="absolute end-0 inset-y-0 flex items-center justify-center px-2">
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" class="size-6 p-0">
                <ChevronDown
                  class="size-4 text-muted-foreground transition"
                  :class="{ 'rotate-180': showExistingFormats }"
                />
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
                  v-for="existingFormat in filteredFormats"
                  :key="existingFormat"
                  :value="existingFormat"
                  @mousedown.prevent="selectFormat(existingFormat.format || '')"
                  class="flex flex-row gap-2"
                >
                  {{ existingFormat.format }}
                  <Badge variant="secondary" class="ml-auto">
                    {{ existingFormat.count }}
                  </Badge>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </template>

    <template v-else>
      <Input id="format" v-model="format" placeholder="e.g., --{{name}}={{value}}" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useCommandStore } from '@/stores/command'
import { ChevronDown, Code } from 'lucide-vue-next'
import { computed, ref, onMounted } from 'vue'

const format = defineModel<string>('format')

const { loadMostPopularFormats, getMostPopularFormats } = useCommandStore()

const formats = computed(() => getMostPopularFormats().value)
const showExistingFormats = ref(false)
const filteredFormats = computed(() =>
  formats.value.filter((format) => format.format?.includes(formatSearch.value)),
)
const selectFormat = (newFormat: string) => {
  format.value = newFormat
  showExistingFormats.value = false
}
const formatSearch = ref('')

onMounted(async () => {
  await loadMostPopularFormats()
})
</script>
