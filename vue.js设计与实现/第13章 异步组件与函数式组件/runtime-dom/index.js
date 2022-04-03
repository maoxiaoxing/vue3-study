import { ref } from '../reactivity/reactivity.js'
import { onMounted } from '../runtime-core/index.js'
// 定义异步组件
export function defineAsyncComponent (options) {
  if (typeof options === 'function') {
    options = {
      loader: options,
    }
  }
  const { loader } = options
  // 存储异步加载的组件
  let InnerComp = null
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false)
      const timeout = ref(false)

      loader().then((c) => {
        InnerComp = c
        loaded.value = true
      })
      let timer = null
      if (options.timeout) {
        timer = setTimeout(() => {
          timeout.value = true
        }, options.timeout)
      }

      onMounted(() => clearTimeout(timer))
      const placeholder = { type: Text, children: '' }

      return () => {
        if (loaded.value) {
          return { type: InnerComp }
        } else if (timeout.value) {
          return options.errorComponent ? { type: options.errorComponent } : placeholder
        }
        return placeholder
      }
    },
  }
}
