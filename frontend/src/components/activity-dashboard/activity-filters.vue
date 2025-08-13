
<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, RefreshCw } from 'lucide-vue-next'

const emit = defineEmits(['search-change', 'status-filter', 'refresh'])

const search = ref("")

const handleSearchChange = (event) => {
  emit('search-change', event.target.value)
}

const handleStatusFilter = (value) => {
  emit('status-filter', value)
}

const handleRefresh = () => {
  emit('refresh')
}
</script>

<template>
  <div class="flex flex-col sm:flex-row flex gap-4 items-start sm:items-center justify-between">
    <div class="flex flex-col sm:flex-row flex gap-2 flex-1">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          :value="search"
          @input="handleSearchChange($event)"
          class="pl-8"
        />
      </div>
      <Select @update:model-value="handleStatusFilter">
        <SelectTrigger class="w-[180px]">
          <Filter class="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="success">Success Only</SelectItem>
          <SelectItem value="failure">Failure Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <Button @click="handleRefresh" variant="outline" size="sm">
      <RefreshCw class="h-4 w-4 mr-2" />
      Refresh
    </Button>
  </div>
</template>