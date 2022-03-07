const isObject = val => val !== null && typeof val === 'object'
const convert = target => isObject(target) ? reactive : target
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export function reactive (target) {
  if (!isObject(target)) {
    return target
  }

  const handler = {
    get (target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      track(target, key)
      return convert(result)
    },
    set (target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver)
      let result = true
      if (oldValue !== value) {
        result = Reflect.set(target, key, value, receiver)
        trigger(target, key)
      }
      return true
    },
    deleteProperty (target, key) {
      const hadKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        // console.log('del', key)
        trigger(target, key)
      }
      return result
    }
  }

  return new Proxy(target, handler)
}

let activeEffect = null
const effectStack = []

export function effect (callback, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = callback() // 访问响应式对象属性，收集依赖
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  // effectFn()
  return effectFn
}

let targetMap = new WeakMap()

export function track (target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  // 把当前激活的副作用函数添加到依赖集合 deps 中
  deps.add(activeEffect)
  // 将其添加到 activeEffect.deps 数组中
  activeEffect.deps.push(deps)
}

export function trigger (target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectsToRun = new Set()
  if (effects) {
    effects.forEach((effectFn) => {
      // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
      // 避免无限递归执行
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }
  
  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
  // if (effects) {
  //   effects.forEach((effect) => {
  //     effect()
  //   })
  // }
}

function cleanup (effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    console.log(deps)
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// export function ref (raw) {
//   if (isObject(raw) && raw._v_isRef) {
//     return
//   }

//   let value = convert(raw)
//   const r = {
//     _v_isRef: true,
//     get value () {
//       track(r, 'value')
//       return value
//     },
//     set value (newValue) {
//       if (newValue !== value) {
//         raw = newValue
//         value = convert(raw)
//         trigger(r, 'value')
//       }
//     }
//   }
//   return r
// }

// export function toRefs (proxy) {
//   const ret = proxy instanceof Array ? new Array(proxy.length) : {}

//   for (const key in proxy) {
//     ret[key] = toProxyRef(proxy, key)
//   }
//   return ret
// }

// function toProxyRef (proxy, key) {
//   const r = {
//     _v_isRef: true,
//     get value () {
//       return proxy[key]
//     },
//     set value (newValue) {
//       proxy[key] = newValue
//     }
//   }
//   return r
// }

export function computed (getter) {
  // 用来缓存上一次计算值
  let value
  // 标志时候需要重新计算值
  let dirty = true
  const effectFn = effect(getter, { 
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
        trigger(obj, 'value')
      }
    }
  })
  const obj = {
    get value () {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 当读取 value 时，调用 track 函数进行追踪
      track(obj, 'value')
      return value
    }
  }
  return obj
}

export function watch (source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }
  let oldValue
  let newValue

  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: () => {
      if (options.flush === 'post') {
        const p = Promise.resolve()
        p.then(job)
      } else {
        job()
      }
    },
  })
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return
  }
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }
  return value
}
