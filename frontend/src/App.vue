<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { useRoute } from 'vue-router'
import 'vue-sonner/style.css'
const route = useRoute()
</script>

<template>
  <Toaster />
  <SidebarProvider>
    <app-sidebar />
    <SidebarInset>
      <app-header />
      <div class="rounded-xl">
        <RouterView :key="route.path" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
