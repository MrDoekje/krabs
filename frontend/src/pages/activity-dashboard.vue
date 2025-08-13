<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ActivityTable from '@/components/activity-dashboard/activity-table.vue'
import ActivityFilters from '@/components/activity-dashboard/activity-filters.vue'
import TaskDetailModal from '@/components/activity-dashboard/task-detail-modal.vue'
import { Activity, TrendingUp, TrendingDown, Clock } from 'lucide-vue-next'

const mockTaskResults = [
  // ... (same mock data as in the React component)
  { id: "task-001", task: { name: "Data Backup Process" }, success: true, createdAt: "2024-01-15T10:30:00Z" },
  { id: "task-002", task: { name: "Email Campaign Sender" }, success: false, createdAt: "2024-01-15T09:45:00Z" },
  { id: "task-003", task: { name: "Database Cleanup" }, success: true, createdAt: "2024-01-15T08:20:00Z" },
  { id: "task-004", task: { name: "Report Generation" }, success: true, createdAt: "2024-01-15T07:15:00Z" },
  { id: "task-005", task: { name: "API Health Check" }, success: false, createdAt: "2024-01-15T06:30:00Z" },
  { id: "task-006", task: { name: "Log Rotation" }, success: true, createdAt: "2024-01-15T05:45:00Z" },
  { id: "task-007", task: { name: "Cache Warming" }, success: true, createdAt: "2024-01-15T04:20:00Z" },
  { id: "task-008", task: { name: "Security Scan" }, success: false, createdAt: "2024-01-15T03:10:00Z" }
];

const searchTerm = ref("")
const statusFilter = ref("all")
const selectedTask = ref(null)
const isModalOpen = ref(false)

const filteredResults = computed(() => {
  return mockTaskResults.filter((result) => {
    const matchesSearch = result.task.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesStatus = statusFilter.value === "all" ||
      (statusFilter.value === "success" && result.success) ||
      (statusFilter.value === "failure" && !result.success)
    return matchesSearch && matchesStatus
  })
})

const stats = computed(() => {
  const total = mockTaskResults.length
  const successful = mockTaskResults.filter(r => r.success).length
  const failed = total - successful
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0
  return { total, successful, failed, successRate }
})

const handleRowClick = (taskResult) => {
  selectedTask.value = taskResult
  isModalOpen.value = true
}

const handleRefresh = () => {
  // In a real app, this would refetch data from the API
  console.log("Refreshing activity data...")
}
</script>

<template>
  <div class="container mx-auto p-6 flex flex-col gap-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight flex items-center flex gap-2">
          <Activity class="h-8 w-8" />
          Global Activity
        </h1>
        <p class="text-muted-foreground">
          Monitor all task executions across your system
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 flex gap-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between flex gap-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Runs</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.total }}</div>
          <p class="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between flex gap-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Successful</CardTitle>
          <TrendingUp class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">{{ stats.successful }}</div>
          <p class="text-xs text-muted-foreground">{{ stats.successRate }}% success rate</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between flex gap-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Failed</CardTitle>
          <TrendingDown class="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">{{ stats.failed }}</div>
          <p class="text-xs text-muted-foreground">{{ 100 - stats.successRate }}% failure rate</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between flex gap-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active Tasks</CardTitle>
          <Activity class="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">3</div>
          <p class="text-xs text-muted-foreground">Currently running</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Click on any row to view detailed execution logs
        </CardDescription>
      </CardHeader>
      <CardContent class="flex gap-y-4">
        <ActivityFilters
          @search-change="searchTerm = $event"
          @status-filter="statusFilter = $event"
          @refresh="handleRefresh"
        />
        
        <ActivityTable
          :task-results="filteredResults"
          @row-click="handleRowClick"
        />
        
        <div v-if="filteredResults.length === 0" class="text-center py-8 text-muted-foreground">
          No task results found matching your criteria.
        </div>
      </CardContent>
    </Card>

    <TaskDetailModal
      :task-result="selectedTask"
      v-model:open="isModalOpen"
    />
  </div>
</template>