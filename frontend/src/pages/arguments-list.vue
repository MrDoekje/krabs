<script lang="ts" setup>
import { ref } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const mockArguments = [
  { id: 1, name: 'username', required: true },
  { id: 2, name: 'email', required: true },
  { id: 3, name: 'password', required: true },
  { id: 4, name: 'firstName', required: false },
  { id: 5, name: 'lastName', required: false },
  { id: 6, name: 'phoneNumber', required: false },
  { id: 7, name: 'dateOfBirth', required: false },
  { id: 8, name: 'address', required: false },
]

const argumentsList = ref(mockArguments)

const handleRowClick = (argumentId) => {
  // Navigate to edit screen - in a real app this would use a router
  console.log(`Maps to edit argument with ID: ${argumentId}`)
  // Example: router.push(`/arguments/${argumentId}/edit`)
}
</script>

<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl font-bold">Arguments</CardTitle>
        <p class="text-muted-foreground">
          List of all defined arguments. Click on any row to edit.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="font-semibold">Name</TableHead>
              <TableHead class="font-semibold w-32">Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="argument in argumentsList"
              :key="argument.id"
              class="cursor-pointer hover:bg-muted/50 transition-colors"
              @click="handleRowClick(argument.id)"
            >
              <TableCell class="font-medium">{{ argument.name }}</TableCell>
              <TableCell>
                <div class="flex items-center">
                  <div v-if="argument.required" class="flex items-center flex gap-2 text-green-600">
                    <Check class="h-4 w-4" />
                    <span class="text-sm">Yes</span>
                  </div>
                  <div v-else class="flex items-center flex gap-2 text-muted-foreground">
                    <X class="h-4 w-4" />
                    <span class="text-sm">No</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div v-if="argumentsList.length === 0" class="text-center py-8 text-muted-foreground">
          No arguments defined yet.
        </div>
      </CardContent>
    </Card>
  </div>
</template>