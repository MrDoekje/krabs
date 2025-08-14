<script setup lang="ts"></script>

<template>
  <SidebarProvider>
    <app-sidebar />
    <SidebarInset>
      <app-header />
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
