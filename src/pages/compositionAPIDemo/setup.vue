<template>
  <div>
    鼠标横坐标：{{ x }}
    鼠标纵坐标：{{ y }}
  </div>
</template>

<script>
import { onMounted, onUnmounted, reactive, toRefs } from 'vue'

const usePosition = () => {
  const position = reactive({
    x: 0,
    y: 0,
  })

  const getPosition = (e) => {
    position.x = e.pageX
    position.y = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', getPosition)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', getPosition)
  })

  return toRefs(position)
}

export default {
  setup() {
    const { x, y } = usePosition()

    return {
      x,
      y,
    }
  }
}
</script>

<style scoped>

</style>
