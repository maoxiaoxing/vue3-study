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
    const storageContainer = createElement('div')

    instance._deActivate = (vnode) => {
      move(vnode, storageContainer)
    }
    instance._activate = (vnode, container, anchor) => {
      move(vnode, container, anchor)
    }

    return () => {
      let rawVNode = slots.default()
      if (typeof rawVNode.type !== 'object') {
        return rawVNode
      }
      const cacheVNode = cache.get(rawVNode.type)
      if (cacheVNode) {
        rawVNode.component = cacheVNode.component
        rawVNode.keptAlive = true
      } else {
        cache.set(rawVNode.type, rawVNode)
      }
      rawVNode.shouldKeepAlive = true
      rawVNode.KeepAliveInstance = instance
      return rawVNode
    }
  }
}

