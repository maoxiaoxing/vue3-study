import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store, { key } from './store'
import elementPlus from './plugins/element-plus'
import './styles/index.scss'

const app = createApp(App)
app.use(router)
app.use(store, key)
app.use(elementPlus, { size: 'small' })
app.mount('#app')
