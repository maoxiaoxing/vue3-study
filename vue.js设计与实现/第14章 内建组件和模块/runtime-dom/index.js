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
  let retires = 0

  function load() {
    return loader()
      .catch((err) => {
        if (options.onError) {
          return new Promise((resolve, reject) => {
            const retry = () => {
              resolve(load())
              retires++
            }
            const fail = () => reject(err)
            options.onError(retry, fail, retires)
          })
        } else {
          throw error
        }
      })
  }

  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false)
      const error = shallowRef(null)
      // 代表组件正在加载
      const loading = ref(false)
      let loadingTimer = null
      if (options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true
        }, options.delay)
      } else {
        loading.value = true
      }

      load()
        .then((c) => {
          InnerComp = c
          loaded.value = true
        })
        .catch((err) => error.value = err)
        .finally(() => {
          loading.value = false
          clearTimeout(loadingTimer)
        })
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
        } else if (loading.value && options.loadingComponent) {
          return { type: options.loadingComponent }
        } else {
          return placeholder
        }
      }
    },
  }
}
