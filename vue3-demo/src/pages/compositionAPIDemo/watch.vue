<template>
  <div>
    <p>
      请问一个 yes/no 的问题:
      <input v-model="question">
    </p>
    <p>{{ answer }}</p>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import _ from 'lodash'

export default {
  setup() {
    const question = ref('')
    const answer = ref('')

    const updateAnswer = _.debounce(async (newValue, oldValue) => {
      const response = await fetch('https://www.yesno.wtf/api')
      const data = await response.json()
      answer.value = data.answer
    }, 1000)

    watch(question, updateAnswer)

    return {
      question,
      answer
    }
  }
}
</script>

<style scoped>

</style>
