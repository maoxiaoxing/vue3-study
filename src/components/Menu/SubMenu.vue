<template>
  <div>
    <el-submenu 
      :index="menu.path"
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
          @click="menuClick"
        >
          {{ subItem.title }}
        </el-menu-item>
      </template>
    </el-submenu>
  </div>
</template>

<script>
import { useRouter } from "vue-router"
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
  },
  setup(props, context) {
    console.log(props, context)
    const router = useRouter()
    const menuClick = (menu) => {
      console.log(menu)
      console.log(router, 'router')
      router.push('/demo/setup')
    }
    return {
      menuClick,
    }
  }
}
</script>

<style scoped>

</style>
