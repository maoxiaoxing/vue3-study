<template>
  <div>
    <el-submenu 
      :index="menu.name"
    >
      <template #title>{{ menu.title }}</template>
      <template
        v-for="subItem in menu.children"
      >
        <sub-menus
          v-if="subItem.children && subItem.children.length > 0"
          :menu="subItem"
          :key="subItem.name" 
        />

        <el-menu-item
          v-else
          :index="subItem.path"
          :key="subItem.name"
        >
          {{ subItem.title }}
        </el-menu-item>
      </template>
    </el-submenu>
  </div>
</template>

<script>

export default {
  name: 'SubMenus',
  props: {
    menu: {
      require: true,
      // default() {
      //   return {
      //     title: '默认导航',
      //     id: Math.floor(Math.random() * 10000),
      //     icon: 'user',
      //     children: [
      //       {
      //         title: '默认子导航',
      //         id: Math.floor(Math.random() * 10000)
      //       }
      //     ]
      //   }
      // }
    }
  }
}
</script>

<style scoped>

</style>
