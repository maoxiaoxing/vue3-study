import { ref, shallowRef } from '../reactivity/reactivity.js'
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
      const error = shallowRef(null)

      loader()
        .then((c) => {
          InnerComp = c
          loaded.value = true
        })
        .catch((err) => error.value = err)
      let timer = null
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error(`Async component timed out after ${options.timeout}ms`)
          error.value = err
        }, options.timeout)
      }

      onMounted(() => clearTimeout(timer))
      const placeholder = { type: Text, children: '' }

      return () => {
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return { type: options.errorComponent, props: { error: error.value } }
        } else {
          return placeholder
        }
      }
    },
  }
}
