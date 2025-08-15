<script lang="ts" setup>
import { ref, watch, defineEmits, defineProps } from 'vue'
import type { CreateArgumentDto } from '@/krabs-sdk/models'

const argument = defineModel<CreateArgumentDto>('argument', {
  default: {
    name: '',
    required: false,
  },
})
</script>

<template>
  <div class="flex gap-1.5 items-center">
    <Input v-model="argument.name" placeholder="Argument name" class="w-40" />
    <Label class="flex items-center gap-1.5">
      <Switch v-model="argument.required" />
      Required
    </Label>
    <slot :argument="argument" />
  </div>
</template>
