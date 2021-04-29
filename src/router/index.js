import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/home/home.vue'
import Setup from '@/pages/compositionAPIDemo/setup.vue'

export const routes = [
  { 
    path: '/home',
    name: 'Home',
    title: '首页',
    component: Home,
  },
  { 
    path: '/demo',
    name: 'CompositionAPIDemo',
    title: 'Composition API Demo',
    children: [
      {
        path: '/demo/setup',
        name: 'Setup',
        title: 'Setup',
        component: Setup,
      },
    ]
  },
]

const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})

export default router
