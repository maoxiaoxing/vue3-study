<template>
  <div>
    123
  </div>
</template>

<script>
import { ref, reactive, watchEffect, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const obj = {}
    const proto = {bar: 1}
    const child = reactive(obj)
    const parent = reactive(proto)
    Object.setPrototypeOf(child, parent)
    const arr = reactive(['foo'])

    watchEffect(() => {
      console.log(child.bar)
      arr.push(1)
      console.log(arr, '00')
    })
    child.bar++
    child.bar++
    arr[1] = 'bar'

    return {
    }
  }
}
</script>

<style scoped>

</style>
