import { createRouter, createWebHashHistory } from 'vue-router'
// import Layout from '@/components/Layout'
import Home from '../pages/home/home.vue'
import Setup from '../pages/compositionAPIDemo/setup.vue'
import Ref from '../pages/compositionAPIDemo/ref.vue'
import Computed from '../pages/compositionAPIDemo/computed.vue'
import Watch from '../pages/compositionAPIDemo/watch.vue'
import WatchEffect from '../pages/compositionAPIDemo/watchEffect.vue'
import todoList from '@/pages/todoList/todoList'
import LifeCycle from '@/pages/compositionAPIDemo/lifeCycle'
import Effect from '@/pages/compositionAPIDemo/effect'

export const routes = [
  {
    path: '/',
    redirect: '/todo',
  },
  {
    path: '/todo',
    name: 'todoList',
    title: 'todoList',
    component: todoList,
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
        path: '/demo/lifeCycle',
        name: 'LifeCycle',
        title: 'LifeCycle',
        component: LifeCycle,
      },
      {
        path: '/demo/ref',
        name: 'Ref',
        title: 'Ref',
        component: Ref,
      },
      {
        path: '/demo/computed',
        name: 'Computed',
        title: 'Computed',
        component: Computed,
      },
      {
        path: '/demo/watch',
        name: 'Watch',
        title: 'Watch',
        component: Watch,
      },
      {
        path: '/demo/watchEffect',
        name: 'WatchEffect',
        title: 'WatchEffect',
        component: WatchEffect,
      },
      {
        path: '/demo/Effect',
        name: 'Effect',
        title: 'Effect',
        component: Effect,
      },
    ]
  },
  // {
  //   path: '/todoList',
  //   name: 'todoList',
  //   title: 'todoList',
  //   component: todoList,
  // },
]

const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})

export default router
