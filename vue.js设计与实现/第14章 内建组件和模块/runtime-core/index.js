// 存储当前正在被初始化的组件实例
let currentInstance = null

// 接收组件实例
export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function onMounted (fn) {
  if (currentInstance) {
    currentInstance.mounted.push(fn)
  } else {
    console.error('onMounted 函数只能在 setup 中使用')
  }
}

export const KeepAlive = {
  _isKeepAlive: true,
  setup(props, { slots }) {
    const cache = new Map()
    const instance = currentInstance
    const { move, createElement } = instance.KeepAliveCtx

    // 创建隐藏容器
    const storageContainer = createElement('div')

    instance._deActivate = (vnode) => {
      move(vnode, storageContainer)
    }
    instance._activate = (vnode, container, anchor) => {
      move(vnode, container, anchor)
    }

    return () => {
      let rawVNode = slots.default()
      // 如果不是组件，直接渲染，因为非组件无法被 keepAlive
      if (typeof rawVNode.type !== 'object') {
        return rawVNode
      }
      const cacheVNode = cache.get(rawVNode.type)
      // 挂载先获取缓存组件，如果有，证明组件只需要被激活，而不是挂载
      if (cacheVNode) {
        rawVNode.component = cacheVNode.component
        // 在组件上标记 keptAlive，避免渲染器重新挂载它
        rawVNode.keptAlive = true
      } else {
        // 添加缓存，下次激活组件就不需要挂载
        cache.set(rawVNode.type, rawVNode)
      }
      // 标记 shouldKeepAlive 属性，避免卸载组件
      rawVNode.shouldKeepAlive = true
      // 将实例添加到 vnode 上，以便在渲染器中访问
      rawVNode.KeepAliveInstance = instance
      return rawVNode
    }
  }
}

