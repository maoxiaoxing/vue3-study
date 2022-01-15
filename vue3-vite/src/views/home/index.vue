<template>
  <h1>首页</h1>
  <div class="home">999</div>
  
  {{$store.state.count}}
</template>

<script lang="ts" setup>
  import { useStore } from '@/store'

  const store = useStore()
  console.log(store.state.count)
</script>

<style lang="scss" scoped>
  .home {
    color: $color;
  }
</style>
