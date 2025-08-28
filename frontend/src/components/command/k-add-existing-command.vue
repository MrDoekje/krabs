<template>
  <Popover v-model:open="open">
    <PopoverTrigger>
      <Button variant="outline" role="combobox" :aria-expanded="open" class="justify-between">
        {{ 'Add existing command...' }}
        <ChevronsUpDown class="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="p-0">
      <Command>
        <CommandInput placeholder="Search command..." class="h-9" v-model="search" />
        <CommandList>
          <CommandEmpty v-if="filteredCommands.length === 0"> No command found. </CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="command in filteredCommands"
              :key="command.id"
              :value="command.value"
              @select="selectCommand(command.value)"
            >
              {{ command.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronsUpDown, Check } from 'lucide-vue-next'
import { useCommandStore } from '@/stores/command'
import type { Command } from '@/krabs-sdk/models'

const { loadAllCommands, getCommandList } = useCommandStore()

onMounted(async () => {
  await loadAllCommands()
})

const commands = computed(() =>
  getCommandList().value.map((c) => ({
    id: c.id,
    value: c,
    label: c.name,
  })),
)

const open = ref(false)
const search = ref('')

const emit = defineEmits<{
  (e: 'add', val: Command): void
}>()

const filteredCommands = computed(() =>
  commands.value.filter((f) => f.label?.toLowerCase().includes(search.value.toLowerCase())),
)

function selectCommand(val: Command) {
  emit('add', val)
  open.value = false
}
</script>
