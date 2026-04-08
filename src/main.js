import { createApp } from 'vue'
import ValidatorApp from './App.vue'
import router from './router/index.js'   

const app = createApp(ValidatorApp)
app.use(router)                          
app.mount('#app')
