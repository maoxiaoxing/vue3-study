<template>
  <div>
  </div>
</template>

<script>
import Vue, {
  onBeforeMount, 
  onMounted, 
  onBeforeUpdate, 
  onUpdated, 
  onBeforeUnmount, 
  onUnmounted,
} from 'vue'

export default {
  setup() {
    onBeforeMount(() => {
      console.log('onBeforeMount')
    })
    onMounted(() => {
      console.log('onMounted')
    })
  }
}
</script>

<style scoped>

</style>
