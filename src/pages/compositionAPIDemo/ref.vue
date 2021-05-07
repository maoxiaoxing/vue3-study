<template>
  <div>
    <el-button 
      type="primary"
      @click="increase"
    >加一个</el-button>
    <p>count：{{ count }}</p>
    <p>uncount: {{ uncount }}</p>
  </div>
</template>

<script>
import { defineComponent, ref, unref, toRef } from 'vue'

const useCount = () => {
  const count = ref(0)
  let uncount = unref(count)
  const increase = () => {
    count.value++
    uncount = unref(count)
  }
  return {
    count,
    increase,
    uncount,
  }
}

const useFoo = () => {
  
}
const refDemo = defineComponent({
  setup() {

    return {
      ...useCount(),
      ...useFoo(),
    }
  }
})
export default refDemo
</script>

<style scoped>

</style>
