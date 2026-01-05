import { createRouter, createWebHistory } from 'vue-router'
import TermsList from '../components/TermsList.vue'
import MindMap from '../components/MindMap.vue'

const routes = [
  {
    path: '/',
    redirect: '/terms'
  },
  {
    path: '/terms',
    name: 'TermsList',
    component: TermsList
  },
  {
    path: '/graph',
    name: 'MindMap',
    component: MindMap
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
