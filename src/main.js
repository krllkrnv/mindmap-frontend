import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.scss'

createApp(App).use(router).mount('#app')

router.isReady().then(() => {
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    window.ym(
      106281217,
      'hit',
      window.location.pathname + window.location.search + window.location.hash
    )
  }

  router.afterEach((to) => {
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      window.ym(106281217, 'hit', to.fullPath)
    }
  })
})
