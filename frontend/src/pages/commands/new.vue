<template>
  <div class="mx-auto w-full p-6 flex flex-col gap-y-6">
    <k-create-command @create="addNewCommand" />
  </div>
</template>

<script setup lang="ts">
import type { Command } from '@/krabs-sdk/models'
import { useCommandStore } from '@/stores/command'

const { createCommand } = useCommandStore()

const addNewCommand = (command: Command) => {
  createCommand(command)
}
</script>

<style scoped></style>
