<template>
  登录
  <el-button>123</el-button>
</template>

<script lang="ts" setup>
import { getLoginInfo } from '@/api/common'
import { onMounted } from "vue";

onMounted(() => {
  getLoginInfo()
    .then((res) => {
      console.log(res)
    })
})
</script>

<style lang="scss" scoped></style>
