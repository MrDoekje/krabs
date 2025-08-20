<script lang="ts" setup>
import { ref, watch, defineEmits, defineProps } from 'vue'
import type { CreateArgumentDto } from '@/krabs-sdk/models'
import { AsteriskSquare, Parentheses } from 'lucide-vue-next'

const argument = defineModel<CreateArgumentDto>('argument', {
  default: {
    name: '',
    required: false,
  },
})
</script>

<template>
  <Card class="bg-muted/60">
    <CardContent class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label class="flex items-center gap-2">
          <Parentheses class="h-4 w-4" />
          Argument
        </Label>
        <Input v-model="argument.name" placeholder="Argument name" />
      </div>
      <Label class="flex justify-between gap-2">
        <div class="gap-2 flex items-center">
          <AsteriskSquare class="h-4 w-4" />
          Required
        </div>

        <Switch v-model="argument.required" />
      </Label>
      <slot :argument="argument" />
    </CardContent>
  </Card>
</template>
