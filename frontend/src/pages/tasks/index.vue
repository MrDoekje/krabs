<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/krabs-sdk/models'
import { useRouter } from 'vue-router'
import { useWithLoading } from '@/composables/withLoading'

const { loadTasks, taskList } = useTasksStore()
const router = useRouter()

onMounted(async () => {
  void loadTasks()
})

const { data: tasks, loading, error, hasLoadedOnce } = useWithLoading({ state: taskList })

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
        <h1>Tasks</h1>
        <p>Manage and monitor all your tasks</p>
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

    <k-with-loading :with-loading="{ loading, data: tasks, error, hasLoadedOnce }">
      <template #loading>
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="n in 5" :key="n">
                  <TableCell class="w-xs">
                    <Skeleton class="h-[1.25rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="w-full h-[1.3125rem]" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </template>

      <template #empty>
        <Card>
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
      </template>

      <template #data="{ data }">
        <Card>
          <CardHeader>
            <CardTitle>All Tasks ({{ data.length }})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="task in data"
                  :key="task.id"
                  @click="handleTaskClick(task)"
                  class="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell class="font-medium">{{ task.name }}</TableCell>
                  <TableCell class="text-muted-foreground">{{ task.description }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </template>
    </k-with-loading>
  </div>
</template>
