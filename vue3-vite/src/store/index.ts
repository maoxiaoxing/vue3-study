import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { InjectionKey } from 'vue'

export interface State {
  count: number
}

export const key: InjectionKey<Store<State>> = Symbol('store')

const store = createStore<State>({
  state () {
    return {
      count: 0,
    }
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})

export function useStore () {
  return baseUseStore(key)
}

export default store
