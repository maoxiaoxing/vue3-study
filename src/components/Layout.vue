<template>
  <el-container>
    <el-header>
      毛小星的 Vue3 demo
    </el-header>
    <el-container>
      <el-aside width="200px">
        <Menu
          :menus="routeStates"
        ></Menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { reactive } from 'vue'
import Menu from '@/components/Menu/Menu.vue'
import { routes } from '@/router'

export default {
  components: {
    Menu
  },
  setup() {
    const routeStates = reactive(routes)
    return {
      routeStates,
    }
  }
}
</script>

<style lang="scss" scoped>
.el-header {
    background-color: #FFF;
    color: #333;
    text-align: center;
    line-height: 60px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
</style>
