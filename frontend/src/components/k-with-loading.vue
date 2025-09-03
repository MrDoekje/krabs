<template>
  <transition name="fade" mode="out-in">
    <div v-if="withLoading.loading || !withLoading.hasLoadedOnce" key="loading">
      <slot name="loading">
        <div class="k-loading-default">Loading...</div>
      </slot>
    </div>
    <div v-else-if="withLoading.error" key="error">
      <slot name="error" :error="withLoading.error">
        <div class="k-error-default">Error: {{ withLoading.error.message }}</div>
      </slot>
    </div>
    <div v-else-if="isEmpty(withLoading.data)" key="empty">
      <slot name="empty">
        <div class="k-empty-default">No data available.</div>
      </slot>
    </div>
    <div v-else key="data">
      <slot name="data" :data="withLoading.data" />
    </div>
  </transition>
</template>

<script lang="ts" setup generic="T">
import type { WithLoading } from '@/composables/withLoading'
import { computed, defineProps } from 'vue'

const props = defineProps<{
  withLoading: WithLoading<T>
  isEmpty?: (data: T) => boolean
}>()

const isEmpty = computed(() => {
  return props.isEmpty ?? ((data: T) => data == null || (Array.isArray(data) && data.length === 0))
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.k-loading-default,
.k-error-default,
.k-empty-default {
  padding: 1em;
  text-align: center;
  color: #888;
}
.k-error-default {
  color: #d32f2f;
}
</style>
