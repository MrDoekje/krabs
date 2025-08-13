<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Search, Terminal, Folder, Eye } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const sampleCommands = [
  { id: '1', name: 'Build Project', command: 'npm run build', wd: '/home/user/projects/my-app', },
  { id: '2', name: 'Start Development Server', command: 'npm run dev', wd: '/home/user/projects/my-app', },
  { id: '3', name: 'Run Tests', command: 'npm test -- --coverage', wd: '/home/user/projects/my-app', },
  { id: '4', name: 'Deploy to Production', command: 'docker build -t myapp . && docker push myapp:latest', wd: '/home/user/projects/my-app', },
  { id: '5', name: 'Database Migration', command: 'npx prisma migrate deploy', wd: '/home/user/projects/my-app', },
  { id: '6', name: 'Lint Code', command: 'eslint . --fix', wd: '/home/user/projects/my-app', },
  { id: '7', name: 'Generate Documentation', command: 'typedoc --out docs src', wd: '/home/user/projects/my-app/docs', },
  { id: '8', name: 'Clean Cache', command: 'rm -rf node_modules/.cache && npm cache clean --force', wd: '/home/user/projects/my-app', },
];

const searchTerm = ref('');
const commands = ref(sampleCommands);

const filteredCommands = computed(() =>
  commands.value.filter(
    (command) =>
      command.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      command.command.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      command.wd.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const handleRowClick = (command) => {
  console.log('Viewing command details:', command);
  alert(`Command Details:\n\nName: ${command.name}\nCommand: ${command.command}\nWorking Directory: ${command.wd}`);
};
</script>

<template>
  <div class="container mx-auto p-6 flex flex-col gap-y-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Commands</h1>
        <p class="text-muted-foreground">Manage and view all available commands in your system</p>
      </div>
      <div class="flex items-center flex gap-2">
        <Badge variant="secondary" class="flex gap-1">
          <Terminal class="h-3 w-3" />
          {{ filteredCommands.length }} commands
        </Badge>
      </div>
    </div>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-lg">Search Commands</CardTitle>
        <CardDescription>Search by name, command, or working directory</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input v-model="searchTerm" placeholder="Search commands..." class="pl-10" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Available Commands</CardTitle>
        <CardDescription>Click on any row to view command details</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[200px]">Name</TableHead>
                <TableHead class="min-w-[300px]">Command</TableHead>
                <TableHead class="w-[250px]">Working Directory</TableHead>
                <TableHead class="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="filteredCommands.length === 0">
                <TableCell colspan="4" class="text-center py-8 text-muted-foreground">No commands found</TableCell>
              </TableRow>
              <TableRow v-else v-for="command in filteredCommands" :key="command.id" @click="handleRowClick(command)" class="cursor-pointer hover:bg-muted/50 transition-colors">
                <TableCell class="font-medium"><div class="flex items-center flex gap-2"><Terminal class="h-4 w-4 text-muted-foreground" />{{ command.name }}</div></TableCell>
                <TableCell><code>{{ command.command }}</code></TableCell>
                <TableCell><div class="flex items-center flex gap-2 text-muted-foreground"><Folder class="h-4 w-4" /><span class="truncate" :title="command.wd">{{ command.wd }}</span></div></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" @click.stop="handleRowClick(command)">
                    <Eye class="h-4 w-4" /><span class="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <div v-if="filteredCommands.length > 0" class="text-sm text-muted-foreground text-center">
      Showing {{ filteredCommands.length }} of {{ commands.length }} commands
    </div>
  </div>
</template>