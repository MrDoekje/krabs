<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        'bg-gradient-to-br from-[color-mix(in_srgb,var(--card)_100%,var(--primary))] to-[color-mix(in_srgb,var(--card)_95%,var(--primary))]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
