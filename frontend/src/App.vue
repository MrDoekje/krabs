<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster />
  <SidebarProvider>
    <app-sidebar />
    <SidebarInset>
      <app-header />
      <div class="rounded-xl">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
