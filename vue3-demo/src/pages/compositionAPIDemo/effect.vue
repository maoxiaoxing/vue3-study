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

    watchEffect(() => {
      console.log(child.bar)
    })
    child.bar++
    child.bar++

    return {
    }
  }
}
</script>

<style scoped>

</style>
