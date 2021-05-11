<template>
  <div>
    <p>
      ----- ref unref -----
    </p>
    <el-button 
      type="primary"
      @click="increase"
    >加一个</el-button>
    <p>count：{{ count }}</p>
    <p>uncount: {{ uncount }}</p>

    <p>
      ----- toref -----
    </p>
    <el-button 
      type="primary"
      @click="toggleFoo"
    >切换foo</el-button>
    <p>fooToRef：{{ fooToRef }}</p>
    <p>foo: {{ fooState.foo }}</p>
    <p>fooRef: {{ fooRef.foo }}</p>

    <p>
      ----- torefs -----
    </p>
    <el-button 
      type="primary"
      @click="changeState"
    >切换foo</el-button>
    <p>foo: {{ foo }}</p>
    <p>fooRef: {{ bar }}</p>

    <p>
      ----- customRef -----
    </p>
    <el-input v-model="delayText" placeholder=""></el-input>
    <p>delayText: {{ delayText }}</p>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, unref, toRef, toRefs, isRef, computed, watch } from 'vue'
import { useDebouncedRef } from '@/utils/customRef'

const useCount = () => {
  const count = ref(0)
  let uncount = unref(count)
  const increase = () => {
    count.value++
    uncount = unref(count)
  }
  return {
    count,
    increase,
    uncount,
  }
}

const useFoo = () => {
  // const fooState = reactive({
  //   foo: true,
  // })
  const fooState = {
    foo: true
  }
  const fooRef = ref(fooState)
  console.log(isRef(fooRef), 'fooRef isRef')
  let fooToRef = toRef(fooState, 'foo')
  console.log(isRef(fooToRef), 'fooToRef isRef')
  console.log(fooRef)

  const toggleFoo = () => {
    console.log(fooState.foo)
    fooRef.value = !fooRef.value
    fooToRef.value = !fooToRef.value
  }

  return {
    fooToRef,
    fooState,
    toggleFoo,
    fooRef,
  }
}

const useFeature = () => {
  const state = reactive({
    foo: 1,
    bar: 1,
  })
  let { bar } = state
  let { foo } = toRefs(state)
  console.log(isRef(bar), isRef(foo), 'bar foo isRef')

  const changeState = () => {
    bar++
    foo.value++
  }

  return {
    bar,
    foo,
    changeState,
  }
}

const useDelayText = () => {
  const text = ref('')
  const delayText = useDebouncedRef('', 1000)

  return {
    delayText,
  }
}

const refDemo = defineComponent({
  setup() {

    return {
      ...useCount(),
      ...useFoo(),
      ...useFeature(),
      ...useDelayText(),
    }
  }
})
export default refDemo
</script>

<style scoped>

</style>
