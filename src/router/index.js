import { createRouter, createWebHistory } from 'vue-router'
import TermsList from '../components/TermsList.vue'
import MindMap from '../components/MindMap.vue'
import TermDetail from '../components/TermDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/graph'
  },
  {
    path: '/terms',
    name: 'TermsList',
    component: TermsList
  },
  {
    path: '/terms/:id',
    name: 'TermDetail',
    component: TermDetail
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
