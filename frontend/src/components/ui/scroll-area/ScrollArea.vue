<script setup lang="ts">
import type { ScrollAreaRootProps } from 'reka-ui'
import { useTemplateRef, type HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from 'reka-ui'
import { cn } from '@/lib/utils'
import ScrollBar from './ScrollBar.vue'

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
const viewportRef = useTemplateRef('viewport')
const scrollAreaRef = useTemplateRef('scrollArea')
defineExpose({ viewport: viewportRef, scrollArea: scrollAreaRef })
</script>

<template>
  <ScrollAreaRoot
    data-slot="scroll-area"
    ref="scrollArea"
    v-bind="delegatedProps"
    :class="cn('relative', props.class)"
  >
    <ScrollAreaViewport
      ref="viewport"
      data-slot="scroll-area-viewport"
      class="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
