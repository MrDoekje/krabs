<template>
  <div class="mx-auto w-full p-6 flex flex-col gap-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1>Commands</h1>
        <p>Manage and monitor all your commands</p>
      </div>
      <router-link :to="{ name: '/commands/new' }">
        <Button size="lg">
          <Plus class="mr-2 h-4 w-4" />
          Create New Command
        </Button>
      </router-link>
    </div>

    <Card v-if="commands.length > 0">
      <CardHeader>
        <CardTitle>All Commands ({{ commands.length }})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Command Name</TableHead>
              <TableHead>Command</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Working directory</TableHead>
              <TableHead>Optional</TableHead>
              <TableHead>Arguments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="command in commands"
              :key="command.id"
              @click="handleCommandClick(command)"
              class="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell class="font-medium">{{ command.name }}</TableCell>
              <TableCell class="text-muted-foreground">{{ command.command }}</TableCell>
              <TableCell class="text-muted-foreground">{{ command.format }}</TableCell>
              <TableCell class="text-muted-foreground !text-wrap break-all max-w-[2rem]">{{
                command.wd
              }}</TableCell>
              <TableCell class="text-muted-foreground">
                <Badge v-if="command.optional" variant="secondary">Optional</Badge>
                <Badge v-else variant="outline">Required</Badge>
              </TableCell>
              <TableCell class="text-muted-foreground">
                <div class="flex flex-col gap-2">
                  <k-argument-or-manage
                    allow-edit
                    v-for="arg in command.arguments"
                    :key="arg.id"
                    :arg="arg"
                  />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card v-else>
      <CardContent class="flex flex-col text-center gap-y-4 items-center justify-center py-12">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold">No commands found</h3>
          <p class="text-muted-foreground">Get started by creating your first command</p>
        </div>
        <router-link :to="{ name: '/commands/new' }">
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            Create New Command
          </Button>
        </router-link>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { Command } from '@/krabs-sdk/models'
import { useRouter } from 'vue-router'
import { useCommandStore } from '@/stores/command'
import { Plus } from 'lucide-vue-next'

const { getCommandList, loadAllCommands } = useCommandStore()
const router = useRouter()

onMounted(async () => {
  void loadAllCommands()
})
const commands = getCommandList()

const handleCommandClick = (command: Command) => {
  router.push({
    name: '/commands/[commandId]',
    params: {
      commandId: command.id as string,
    },
  })
}
</script>

<style scoped></style>
