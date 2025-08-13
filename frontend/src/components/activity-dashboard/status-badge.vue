<script lang="ts" setup>
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-vue-next'

const props = defineProps({
  success: {
    type: Boolean,
    required: true
  }
})

const badgeClasses = props.success
  ? 'bg-green-100 text-green-800 hover:bg-green-100'
  : 'bg-red-100 text-red-800 hover:bg-red-100'
</script>

<template>
  <Badge 
    :variant="success ? 'default' : 'destructive'"
    :class="['flex items-center flex gap-1', badgeClasses]"
  >
    <CheckCircle v-if="success" class="h-3 w-3" />
    <XCircle v-else class="h-3 w-3" />
    <span>{{ success ? "Success" : "Failure" }}</span>
  </Badge>
</template>