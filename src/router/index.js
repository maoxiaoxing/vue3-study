import { createRouter, createWebHashHistory } from 'vue-router'
// import Layout from '@/components/Layout'
import Home from '../pages/home/home.vue'
import Setup from '../pages/compositionAPIDemo/setup.vue'
import Ref from '../pages/compositionAPIDemo/ref.vue'

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
    redirect: '/demo/setup',
    component: Home,
    children: [
      {
        path: '/demo/setup',
        name: 'Setup',
        title: 'Setup',
        component: Setup,
      },
      {
        path: '/demo/ref',
        name: 'Ref',
        title: 'Ref',
        component: Ref,
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
