import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import ValidatorApp from '../components/SbmlValidator.vue'  
import HelpPage from '../components/HelpPage.vue'

const STANDALONE_BASE = '/vue3-sbml-validator/'

function pickHistory() {
  // When the built bundle is embedded into another site (e.g. Hugo),
  // the hosting page path usually won't be under STANDALONE_BASE.
  // In that case, history-mode routing won't match and the app renders blank.
  // Hash history keeps routing self-contained and works from any host path.
  if (typeof window !== 'undefined' && window.location.pathname.startsWith(STANDALONE_BASE)) {
    return createWebHistory(STANDALONE_BASE)
  }
  return createWebHashHistory()
}

const routes = [
  { path: '/',     component: ValidatorApp },
  { path: '/help', component: HelpPage },
]

export default createRouter({
  history: pickHistory(),
  routes,
})
