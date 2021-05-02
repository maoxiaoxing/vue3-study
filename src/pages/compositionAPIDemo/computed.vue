<template>
  <div>
    <el-input v-model="todo" placeholder="请输入todo"></el-input>
    <el-button type="primary" @click="addTodo">添加TODO项</el-button>

    <div>
      已完成：{{ activeCount }}
      <el-table :data="todos">
        <el-table-column label="todo项" prop="text"></el-table-column>
        <el-table-column label="是否完成" prop="completed">
          <template #default="scope">
            {{ useCompleted(scope.row.completed) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              type="text" 
              v-if="!scope.row.completed"
              @click="toggleCompleted(scope.row)"
            >标记完成</el-button>
            <el-button 
              type="text" 
              v-else
              @click="toggleCompleted(scope.row)"
            >标记未完成</el-button>
            <el-popconfirm
              title="确定删除吗？"
              confirmButtonText="确定"
              cancelButtonText="取消"
              @confirm="delTodo(scope)"
            >
              <template #reference>
                <el-button 
                  type="text"
                >删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const useTodo = () => {
  const todo = ref('')
  const todos = reactive([
    { text: '看书', completed: true },
    { text: '看电影', completed: false },
  ])

  const activeCount = computed(() => {
    return todos.filter(item => !item.completed).length
  })

  const useCompleted = (completed) => {
    const completedMap = new Map([
      [true, '是'],
      [false, '否'],
    ])
    const text = computed(() => completedMap.get(completed))
    // return completedMap.get(completed)
    return text.value
  }

  const addTodo = () => {
    if (!todo.value) {
      ElMessage({
        message: '请填写todo项',
        type: 'error'
      });
      return false
    }
    todos.push({ text: todo.value, copmlated: false })
  }

  const toggleCompleted = (row) => {
    row.completed = !row.completed
  }

  const delTodo = (scope) => {
    console.log(scope)
    const { $index } = scope
    todos.splice($index, 1)
  }

  return {
    todo,
    todos,
    activeCount,
    addTodo,
    toggleCompleted,
    delTodo,
    useCompleted,
  }
}

export default {
  setup() {

    return {
      ...useTodo(),
    }
  }
}
</script>

<style scoped>

</style>
