<template>
  <div>
    <el-button 
      type="primary"
      @click="increase"
    >加一个</el-button>
    <p>count：{{ count }}</p>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

const useCount = () => {
  const count = ref(0)
  const increase = () => {
    console.log(123)
    count.value++
  }
  return {
    count,
    increase,
  }
}
const refDemo = defineComponent({
  setup() {
    return {
      ...useCount()
    }
  }
})
export default refDemo
</script>

<style scoped>

</style>
