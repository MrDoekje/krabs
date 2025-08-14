<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import { CircleCheckBig, Home, LayoutDashboard } from 'lucide-vue-next'

import type { RouteMap, RouterLinkProps } from 'vue-router'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

// This is sample data.
const data: {
  navMain: Array<{
    title: string
    url: keyof RouteMap
    icon: typeof Home | typeof CircleCheckBig | typeof LayoutDashboard
  }>
} = {
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
      // isActive: true,
    },
    {
      title: 'Tasks',
      url: '/tasks/',
      icon: CircleCheckBig,
    },
    {
      title: 'Activity',
      url: '/activity/',
      icon: LayoutDashboard,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <!-- <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader> -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          <router-link v-for="item in data.navMain" :key="item.title" :to="item.url">
            <SidebarMenuItem>
              <SidebarMenuButton :tooltip="item.title">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </router-link>
        </SidebarMenu>
      </SidebarGroup>
      <!-- <NavProjects :projects="data.projects" /> -->
    </SidebarContent>
    <!-- <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter> -->
    <SidebarRail />
  </Sidebar>
</template>
