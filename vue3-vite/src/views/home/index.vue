<template>
  首页
  {{$store.state.count}}
</template>

<script lang="ts" setup>
  import { useStore } from '../../store'

  const store = useStore()
  console.log(store.state.count)
</script>

<style lang="scss" scoped></style>
