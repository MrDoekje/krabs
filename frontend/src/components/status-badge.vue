<script lang="ts" setup>
import { defineProps } from 'vue';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-vue-next';

const props = defineProps({ status: String });

const variants = {
  Success: 'bg-green-100 text-green-800 border-green-200',
  Failed: 'bg-red-100 text-red-800 border-red-200',
  Running: 'bg-blue-100 text-blue-800 border-blue-200',
};
</script>

<template>
  <Badge variant="outline" :class="variants[status] || ''">
    <CheckCircle v-if="status === 'Success'" class="h-4 w-4 text-green-600" />
    <XCircle v-else-if="status === 'Failed'" class="h-4 w-4 text-red-600" />
    <Loader2 v-else-if="status === 'Running'" class="h-4 w-4 text-blue-600 animate-spin" />
    <Clock v-else class="h-4 w-4 text-gray-400" />
    <span class="ml-1">{{ status }}</span>
  </Badge>
</template>