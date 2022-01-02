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

      return convert(result)
    },
    set (target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver)
      let result = true
      if (oldValue !== value) {
        result = Reflect.set(target, key, value, receiver)
      }
      return true
    },
    deleteProperty (target, key) {
      const hadKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        console.log('del', key)
      }
      return result
    }
  }

  return new Proxy(target, handler)
}
