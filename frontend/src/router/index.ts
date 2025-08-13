import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...routes,
    // {
    //   path: '/',
    //   redirect: '/task-list',
    // },
    // {
    //   path: '/task-list',
    //   name: 'task-list',
    //   component: () => import('../views/task-list.vue'),
    // },
    // {
    //   path: '/activity-dashboard',
    //   name: 'activity-dashboard',
    //   component: () => import('../views/activity-dashboard.vue'),
    // },
    // {
    //   path: '/command-list',
    //   name: 'command-list',
    //   component: () => import('../views/command-list.vue'),
    // },
    // {
    //   path: '/queue-detail-edit',
    //   name: 'queue-detail-edit',
    //   component: () => import('../views/queue-detail-edit.vue'),
    // },
    // {
    //   path: '/argument-edit-form',
    //   name: 'argument-edit-form',
    //   component: () => import('../views/argument-edit-form.vue'),
    // },
    // {
    //   path: '/create-queue-modal',
    //   name: 'create-queue-modal',
    //   component: () => import('../views/create-queue-modal.vue'),
    // },
    // {
    //   path: '/queues-list',
    //   name: 'queues-list',
    //   component: () => import('../views/queues-list.vue'),
    // },
    // {
    //   path: '/arguments-list',
    //   name: 'arguments-list',
    //   component: () => import('../views/arguments-list.vue'),
    // },
    // {
    //   path: '/create-queue',
    //   name: 'create-queue',
    //   component: () => import('../views/create-queue.vue'),
    // },
    // {
    //   path: '/task-details/:id',
    //   name: 'task-details',
    //   props: true,
    //   component: () => import('../views/task-details.vue'),
    // },
    // {
    //   path: '/command-details-edit',
    //   name: 'command-details-edit',
    //   component: () => import('../views/command-details-edit.vue'),
    // },
    // {
    //   path: '/create-task-screen',
    //   name: 'create-task-screen',
    //   component: () => import('../views/create-task-screen.vue'),
    // },
  ],
})

export default router
