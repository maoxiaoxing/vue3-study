import { customRef } from 'vue'

/**
 * @description 防抖赋值 ref
 * @param {value} value 
 * @param {delay} delay 
 * @returns customRef
 */
export const useDebouncedRef = (value, delay = 200) => {
  let timeOut
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeOut)
        timeOut = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}
