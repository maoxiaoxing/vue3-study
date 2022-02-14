import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/admin/home'
  },
  {
    path: '/admin',
    // component: AppLayout,
    name: '/home',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'home', // 默认子路由
        name: 'home',
        component: () => import('../views/home/index.vue'),
        meta: { title: '首页' }
      },
    ]
  },
  {
    path: '/login',
    name: '/login',
    component: () => import('../views/login/index.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
