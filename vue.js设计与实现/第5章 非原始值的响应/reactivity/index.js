const isObject = val => val !== null && typeof val === 'object'
const convert = (target, isReadonly) => {
  return isObject(target) ? isReadonly ? readonly(target) : reactive(target) : target
}
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)
const getType = (proto) => {
  const type = Object.prototype.toString.call(proto).toLowerCase()
  return type.slice(8, type.length - 1)
}
// console.log(getType(new Set()))
const ObservableType = 'Map,Set,WeakMap,WeakSet'.toLowerCase()

const ITERATE_KEY = Symbol()
const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE',
}
const reactiveMap = new Map()

const arrayInstrumentations = {}

;['includes', 'indexOf', 'lastIndexOf'].forEach((method) => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args) {
    let res = originMethod.apply(this, args)
    if (res === false) {
      // res 为 false 说明没有找到，通过 this.raw 拿到原始数组，再去其中查找更新res的值
      res = originMethod.apply(this.raw, args)
    }
    return res
  }
})

let shouldTrack = true
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach((method) => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args) {
    shouldTrack = false
    let res = originMethod.apply(this, args)
    shouldTrack = true
    return res
  }
})

const mutableInstrumentations = {
  add(key) {
    const target = this.raw
    const res = target.add(key)
    trigger(target, key, TriggerType.ADD)
    return res
  }
}

function createReactive(target, isShallow = false, isReadonly = false) {
  if (!isObject(target)) {
    return target
  }

  const handler = {
    get (target, key, receiver) {
      // 代理对象通过raw访问原始对象
      if (key === 'raw') {
        return target
      }

      if (ObservableType.includes(getType(target))) {
        if (key === 'size') {
          track(target, ITERATE_KEY)
          return Reflect.get(target, key, target)
        }
        return mutableInstrumentations[key]
      }

      if (Array.isArray(target) && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }

      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }
      const result = Reflect.get(target, key, receiver)

      if (isShallow) {
        return result
      }
      return convert(result, isReadonly)
    },
    set (target, key, value, receiver) {
      let result = true
      if (isReadonly) {
        console.warn(`属性${key}是只读的`)
        return result
      }
      // const type = hasOwn(target, key) ? TriggerType.SET : TriggerType.ADD
      const type = Array.isArray(target) 
        ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD 
        : hasOwn(target, key) ? TriggerType.SET : TriggerType.ADD
      const oldValue = Reflect.get(target, key, receiver)
      result = Reflect.set(target, key, value, receiver)

      if (target === receiver.raw) {
        // 新值和旧值不相等，并且都不是 NaN
        if (oldValue !== value && (oldValue === oldValue || value === value)) {
          trigger(target, key, type, value)
        }
      }
      
      return result
    },
    deleteProperty (target, key) {
      let result = true
      if (isReadonly) {
        console.warn(`属性${key}是只读的`)
        return result
      }
      const hadKey = hasOwn(target, key)
      result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        // console.log('del', key)
        trigger(target, key, TriggerType.DELETE)
      }
      return result
    },
    ownKeys(target) {
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
      return Reflect.ownKeys(target)
    }
  }

  return new Proxy(target, handler)
}

export function reactive (target) {
  // 优先从代理对象中找到原始代理对象
  const existionProxy = reactiveMap.get(target)
  if (existionProxy) return existionProxy

  const proxy = createReactive(target)
  reactiveMap.set(target, proxy)
  return proxy
}

// 浅响应
export function shallowReactive(target) {
  return createReactive(target, true)
}

export function readonly(target) {
  return createReactive(target, false, true)
}

export function shallowReadonly(target) {
  return createReactive(target, true, true)
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
  if (!activeEffect || !shouldTrack) return
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

export function trigger (target, key, type, newValue) {
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

  if (type === TriggerType.ADD || type === TriggerType.DELETE) {
    // 获取与 ITERATE_KEY 相关联的副作用函数
    const iterateEffects = depsMap.get(ITERATE_KEY)
    if (iterateEffects) {
      iterateEffects.forEach((effectFn) => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn)
        }
      })
    }
  }

  if (type === TriggerType.ADD && Array.isArray(target)) {
    const lengthEffects = depsMap.get('length')
    lengthEffects && lengthEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, key) => {
      if (key >= newValue) {
        effects.forEach((effectFn) => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
          }
        })
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

  let cleanup
  function onInvalidate(fn) {
    cleanup = fn
  }
  const job = () => {
    newValue = effectFn()
    if (cleanup) {
      cleanup()
    }
    cb(newValue, oldValue, onInvalidate)
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
