<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import { useActivityStore } from '@/stores/activity'
import { CircleCheckBig, Home, LayoutDashboard } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'

import { useRoute, type RouteMap } from 'vue-router'
import CardContent from '../ui/card/CardContent.vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

const route = useRoute()

const { loadTaskResults, listenToQueueEvents, getTaskResultList } = useActivityStore()

const taskResults = computed(() => getTaskResultList().value)

onMounted(async () => {
  await loadTaskResults()
  await listenToQueueEvents()
})

const isRouteActive = (url: string) => {
  return route.path === url
}

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
  <Sidebar v-bind="props" variant="inset" collapsible="offcanvas">
    <!-- <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader> -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          <router-link v-for="item in data.navMain" :key="item.title" :to="item.url">
            <SidebarMenuItem>
              <SidebarMenuButton :tooltip="item.title" :is-active="isRouteActive(item.url)">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </router-link>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarGroup v-if="taskResults?.length">
        <SidebarGroupLabel>Active tasks</SidebarGroupLabel>
        <ScrollArea class="max-h-64">
          <div class="flex flex-col gap-2">
            <template v-for="taskResult in taskResults">
              <HoverCard side="right" v-if="taskResult.id">
                <HoverCardTrigger as-child>
                  <router-link
                    :key="taskResult.id"
                    :to="{
                      name: '/activity/[taskResultId]',
                      params: { taskResultId: taskResult.id },
                    }"
                  >
                    <Card class="bg-muted/60 hover:bg-muted/10" :key="taskResult.id">
                      <CardContent>
                        <p class="line-clamp-4 text-xs">
                          {{ taskResult.task?.name || taskResult.id }}
                        </p>
                        <span class="line-clamp-1 text-xs text-muted-foreground font-mono">{{
                          taskResult.id
                        }}</span>
                      </CardContent>
                    </Card>
                  </router-link>
                </HoverCardTrigger>
                <HoverCardContent
                  class="w-min"
                  align="end"
                  side="right"
                  updatePositionStrategy="always"
                >
                  <k-task-result :task-result="taskResult" />
                </HoverCardContent>
              </HoverCard>
            </template>
          </div>
        </ScrollArea>
      </SidebarGroup>
    </SidebarFooter>
  </Sidebar>
</template>
