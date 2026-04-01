import { createRouter, createWebHistory } from 'vue-router'
import ValidatorApp from '../components/SbmlValidator.vue'      // or wherever your main validator lives
import HelpPage from '../components/HelpPage.vue'

const routes = [
  { path: '/',     component: ValidatorApp },
  { path: '/help', component: HelpPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
