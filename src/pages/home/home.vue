<template>
  {{ state.msg }}
</template>

<script>
import { reactive } from "vue";

export default {
  setup() {
    const state = reactive({
      msg: 'home'
    })
    return {
      state,
    }
  }
}
</script>

<style>

</style>