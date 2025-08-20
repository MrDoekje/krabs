<template>
  <Card class="grow bg-muted/40 py-2">
    <CardContent class="px-4 flex items-center justify-between gap-6">
      <div>
        <p class="font-medium font-mono text-sm">{{ arg.name }}</p>
      </div>
      <Badge :variant="arg.required ? 'default' : 'secondary'">
        {{ arg.required ? 'Required' : 'Optional' }}
      </Badge>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { Argument } from '@/krabs-sdk/models'
import { defineProps } from 'vue'

defineProps<{
  arg: Argument
}>()
</script>

<style scoped></style>
