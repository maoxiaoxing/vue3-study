<template>
  <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  <!-- <router-view></router-view> -->
  <Layout></Layout>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import Layout from "./components/Layout.vue";

export default {
  name: 'App',
  components: {
    // HelloWorld,
    Layout,
  }
}
</script>

<style>
@import "./style/index.scss"
</style>
