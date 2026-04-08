import { createRouter, createWebHistory } from 'vue-router'
import ValidatorApp from '../components/SbmlValidator.vue'  
import HelpPage from '../components/HelpPage.vue'

const routes = [
  { path: '/',     component: ValidatorApp },
  { path: './help', component: HelpPage },
]

export default createRouter({
  history: createWebHistory('/vue3-sbml-validator/'),
  routes,
})
