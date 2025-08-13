<script lang="ts" setup>
import { formatDistanceToNow } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import StatusBadge from "./status-badge.vue"

const props = defineProps({
  taskResults: {
    type: Array,
    required: true,
  }
})

const emit = defineEmits(['row-click'])

const handleRowClick = (taskResult) => {
  emit('row-click', taskResult)
}

const formatRelativeTime = (dateString) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

const formatTimestamp = (dateString) => {
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead class="w-[150px]">Time ago</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="result in taskResults"
          :key="result.id"
          class="cursor-pointer hover:bg-muted/50 transition-colors"
          @click="handleRowClick(result)"
        >
          <TableCell class="font-medium">
            {{ result.task.name }}
          </TableCell>
          <TableCell>
            <StatusBadge :success="result.success" />
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ formatTimestamp(result.createdAt) }}
          </TableCell>
          <TableCell class="text-muted-foreground text-sm">
            {{ formatRelativeTime(result.createdAt) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>