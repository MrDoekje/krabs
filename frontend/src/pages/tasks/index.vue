<script lang="ts" setup>
import { onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/krabs-sdk/models'
import { useRouter } from 'vue-router'

const { getTaskList, loadTasks } = useTasksStore()
const router = useRouter()

onMounted(async () => {
  void loadTasks()
})
const tasks = getTaskList()

const handleTaskClick = (task: Task) => {
  router.push({
    name: '/tasks/[taskId]/',
    params: {
      taskId: task.id as string,
    },
  })
}
</script>

<template>
  <div class="mx-auto w-full p-6 flex flex-col gap-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Tasks</h1>
        <p class="text-muted-foreground">Manage and monitor all your tasks</p>
      </div>
      <router-link
        :to="{
          name: '/tasks/new',
        }"
      >
        <Button size="lg">
          <Plus class="mr-2 h-4 w-4" />
          Create New Task
        </Button>
      </router-link>
    </div>

    <Card v-if="tasks.length > 0">
      <CardHeader>
        <CardTitle>All Tasks ({{ tasks.length }})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="task in tasks"
              :key="task.id"
              @click="handleTaskClick(task)"
              class="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell class="font-medium">{{ task.name }}</TableCell>
              <TableCell class="text-muted-foreground">{{ task.description }}</TableCell>
              <TableCell>
                <Badge :variant="task.queued ? 'default' : 'secondary'">{{
                  task.queued ? 'Queued' : 'Idle'
                }}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card v-else>
      <CardContent class="flex flex-col text-center gap-y-4 items-center justify-center py-12">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold">No tasks found</h3>
          <p class="text-muted-foreground">Get started by creating your first task</p>
        </div>
        <router-link
          :to="{
            name: '/tasks/new',
          }"
        >
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        </router-link>
      </CardContent>
    </Card>
  </div>
</template>
