<template>
  <div>
    <el-button type="primary" @click="increase">++</el-button>
    <el-button type="primary" @click="stop">stop</el-button>
    <p>{{ count }}</p>
  </div>
</template>

<script>
import { watchEffect, ref } from 'vue'
import { useStore } from 'vuex'

const useCount = () => {
  const count = ref(0)
  const store = useStore()

  const increase = () => {
    store.commit('increment', 1)
    console.log(store.getters.getState)
    count.value++
  }

  const stop = watchEffect(() => {
    console.log(count.value)
  })

  return {
    count,
    stop,
    increase,
  }
}

export default {
  setup() {
    return {
      ...useCount(),
    }
  }
}
</script>

<style scoped>

</style>
