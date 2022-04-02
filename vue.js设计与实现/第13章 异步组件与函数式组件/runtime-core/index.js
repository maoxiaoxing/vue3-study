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

