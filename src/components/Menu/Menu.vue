<template>
  <div>
    <el-menu 
      :default-active="activeIndex"
    >
      <template v-for="item in menus">
        <template v-if="item.children && item.children.length > 0">
          <sub-menus
            :key="item.name"
            :menu="item"
          ></sub-menus>
        </template>

        <template v-else>
          <el-menu-item
            :key="item.name"
            :title="item.title"
            :index="item.name"
            :icon="item.icon || 'user'"
            :href="item.path"
            @click="menuClick"
          >
            {{ item.title }}
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import SubMenus from '@/components/Menu/SubMenu';

export default {
  components: {
    SubMenus,
  },
  props: {
    menus: {
      require: true
    }
  },
  data() {
    return {
      activeIndex: 'home'
    }
  },
  setup() {
    const menuClick = (route) => {
      console.log(route, 'route')
    }
    return {
      menuClick
    }
  }
}
</script>

<style scoped>

</style>
