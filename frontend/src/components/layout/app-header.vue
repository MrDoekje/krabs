<template>
  <header
    class="flex rounded-t-xl h-14 border-border border-b sticky top-0 bg-background/10 backdrop-blur-sm shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
  >
    <div class="flex h-6 items-center gap-4 px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" class="mr-2" />
      <Breadcrumb>
        <BreadcrumbList>
          <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
            <BreadcrumbItem>
              <template v-if="idx < breadcrumbs.length - 1">
                <BreadcrumbLink :as="RouterLink" :to="{ name: crumb.name }">{{
                  crumb.label
                }}</BreadcrumbLink>
              </template>
              <template v-else>
                <BreadcrumbPage>{{ crumb.label }}</BreadcrumbPage>
              </template>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="idx < breadcrumbs.length - 1" />
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, type RouteRecordNormalized, type RouteRecordRaw } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'

const route = useRoute()

const routeBreadcrumbMap: Record<
  keyof RouteNamedMap,
  (route: RouteRecordNormalized | RouteRecordRaw) => string
> = {
  '/': () => 'Home',
  '/activity/': () => 'Activity',
  '/activity/[taskResultId]': () => 'Task Result',
  '/tasks/': () => 'Tasks',
  '/tasks/[taskId]/': () => 'Task Details',
  '/tasks/[taskId]/commands/[commandId]': () => 'Command Details',
  '/tasks/[taskId]/edit': () => 'Edit Task',
  '/tasks/new': () => 'Create Task',
}

const breadcrumbs = computed(() => {
  return route.matched
    .map((record) => {
      let recordOrChildren: RouteRecordNormalized | RouteRecordRaw = record
      if (!record.name) {
        const childWithEmptyRoute = record.children.find((r) => r.name && r.path === '')
        if (!childWithEmptyRoute) {
          return null
        }
        recordOrChildren = childWithEmptyRoute
      }
      // Use meta.breadcrumb if available, otherwise fallback to name or path
      let label
      if (recordOrChildren.name && recordOrChildren.name in routeBreadcrumbMap) {
        label =
          routeBreadcrumbMap[recordOrChildren.name as keyof typeof routeBreadcrumbMap](
            recordOrChildren,
          )
      }
      if (!label) {
        label = recordOrChildren.name || recordOrChildren.path
      }

      // Build full path for navigation
      // const fullPath = arr
      //   .slice(0, idx + 1)
      //   .map((r) => resolvePath(r.path, route.params))
      //   .join('')
      //   .replace(/\/+/g, '/')

      // // Ensure trailing slash for navigation
      // const fullPathWithSlash = ensureTrailingSlash(fullPath)

      return {
        label,
        name: recordOrChildren.name,
      }
    })
    .filter((crumb, idx, arr) => {
      return (
        crumb !== null && crumb.name && arr.findIndex((c) => c && c.name === crumb.name) === idx
      )
    }) as {
    label: string
    name: string
  }[]
})
</script>
