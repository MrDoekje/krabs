<template>
  <div class="flex items-center gap-2 justify-between p-3 border rounded-lg">
    <div>
      <p class="font-medium font-mono text-sm">{{ arg.name }}</p>
    </div>
    <Badge :variant="arg.required ? 'default' : 'secondary'">
      {{ arg.required ? 'Required' : 'Optional' }}
    </Badge>
  </div>
</template>

<script setup lang="ts">
import type { Argument } from '@/krabs-sdk/models'
import { defineProps } from 'vue'

defineProps<{
  arg: Argument
}>()
</script>

<style scoped></style>
