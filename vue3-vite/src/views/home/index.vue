<template>
  <h1>首页</h1>
  <div class="home">999</div>
  
  {{$store.state.count}}

  <el-date-picker
    v-model="value2"
    type="datetime"
    placeholder="Select date and time"
    :shortcuts="shortcuts"
  >
  </el-date-picker>
</template>

<script lang="ts" setup>
  import { useStore } from '@/store'

  const store = useStore()
  console.log(store.state.count)
  const value2 = ''
</script>

<style lang="scss" scoped>
  .home {
    color: $color;
  }
</style>
