import { createRouter, createWebHistory, RouterView } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import I18nManager from '../i18n/manager'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: "/:locale?", 
      component: RouterView,  
      beforeEnter: I18nManager.routeMiddleware.bind(I18nManager),
      children: [  
        {
          path: '', 
          name: 'home',
          component: HomeView
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue')
        },
        {
          path: 'historico',
          name: 'historico',
          component: () => import('../views/HistoricoView.vue')
        },
        {
          path: 'estatisticas',
          name: 'estatisticas',
          component: () => import('../views/EstatisticasView.vue')
        },
        {
          path: 'perguntas',
          name: 'perguntas',
          component: () => import('../views/PerguntasView.vue')
        }
      ]
    }
  ]
})

export default router;