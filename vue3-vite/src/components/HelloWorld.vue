<template>
  <h1>{{ msg }}</h1>
  <p>{{ count }}</p>
  <button @click="increment">
    increment
  </button>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  msg: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['increment'])

const count = ref(0)
const increment = () => {
  console.log(props.msg)
  count.value++
  emits('increment')
}
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
