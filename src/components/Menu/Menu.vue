<template>
  <div>
    <el-menu 
      :default-active="activeIndex"
      router
    >
      <template v-for="item in menus">
        <template v-if="item.children && item.children.length > 0">
          <sub-menus
            :key="item.name"
            :menu="item"
          ></sub-menus>
        </template>

        <template v-else-if="item.component">
          <el-menu-item
            :key="item.name"
            :title="item.title"
            :index="item.path"
            :icon="item.icon || 'user'"
            :href="item.path"
          >
            {{ item.title }}
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { watch, ref } from 'vue'
import { useRoute } from 'vue-router'
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
  setup() {
    const route = useRoute()
    const activeIndex = ref('/')
    watch(() => route.path, () => {
      activeIndex.value = route.path
    })
    return {
      activeIndex,
    }
  }
}
</script>

<style scoped>

</style>
