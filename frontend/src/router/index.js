import { createRouter, createWebHistory, RouterView } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import I18nManager from '@/i18n/manager'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [{ path: '/:locale?', component: RouterView, beforeEnter: I18nManager.routeMiddleware.bind(I18nManager), children: [
    { path: '', name: 'home', component: HomeView },
    { path: 'gerando', name: 'gerando', component: () => import('@/views/GerandoView.vue') },
    { path: 'perguntas', name: 'perguntas', component: () => import('@/views/PerguntasView.vue') },
    { path: 'correcao', name: 'correcao', component: () => import('@/views/CorrecaoView.vue') },
    { path: 'resultado', name: 'resultado', component: () => import('@/views/ResultadoView.vue') }
  ] }]
})
export default router
