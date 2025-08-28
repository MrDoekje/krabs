<template>
  <Popover v-model:open="open">
    <PopoverTrigger as="template">
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-[200px] justify-between"
        @click="open = !open"
      >
        {{ selectedLabel || 'Select framework...' }}
        <ChevronsUpDown class="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandInput placeholder="Search framework..." class="h-9" v-model="search" />
        <CommandList>
          <CommandEmpty v-if="filteredFrameworks.length === 0"> No framework found. </CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="framework in filteredFrameworks"
              :key="framework.value"
              :value="framework.value"
              @click="selectFramework(framework.value)"
            >
              {{ framework.label }}
              <Check
                class="ml-auto"
                :class="value === framework.value ? 'opacity-100' : 'opacity-0'"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronsUpDown, Check } from 'lucide-vue-next'
import { useCommandStore } from '@/stores/command'

const { loadAllCommands, commandsList } = useCommandStore()

onMounted(async () => {
  await loadAllCommands()
})

const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt.js', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]

const open = ref(false)
const value = ref('')
const search = ref('')

const filteredFrameworks = computed(() =>
  frameworks.filter((f) => f.label.toLowerCase().includes(search.value.toLowerCase())),
)

const selectedLabel = computed(() => frameworks.find((f) => f.value === value.value)?.label)

function selectFramework(val) {
  value.value = value.value === val ? '' : val
  open.value = false
}
</script>
