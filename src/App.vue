<template>
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <router-link to="home">首页</router-link>
  <router-view></router-view>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>

</style>
