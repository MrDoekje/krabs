<template>
  <header
    class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
  >
    <div class="flex items-center gap-2 px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
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
import {
  RouterLink,
  useRoute,
  useRouter,
  type RouteRecordNormalized,
  type RouteRecordRaw,
} from 'vue-router'

const route = useRoute()
const router = useRouter()

// Helper to resolve route params in path
function resolvePath(path: string, params: Record<string, any>) {
  return path.replace(/:([^/]+)/g, (_, key) => params[key] ?? '')
}

// Ensure trailing slash utility
function ensureTrailingSlash(path: string) {
  return path.endsWith('/') ? path : path + '/'
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
      let label = recordOrChildren.meta?.breadcrumb
      if (typeof label === 'function') {
        label = label(route)
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
