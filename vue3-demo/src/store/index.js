import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { InjectionKey } from 'vue'

export const key = Symbol('store')

const store = createStore({
  state () {
    return {
      count: 0,
    }
  },
  mutations: {
    increment (state) {
      console.log(this, 'this')
      state.count++
    }
  },
  getters: {
    getState(state) {
      console.log(this, '')
      return state.count++
    }
  }
})

export function useStore () {
  return baseUseStore(key)
}

export default store
