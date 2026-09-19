import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import UploadView from '@/views/UploadView.vue'
import GeneratingView from '@/views/GeneratingView.vue'
import QuizView from '@/views/QuizView.vue'
import GradingView from '@/views/GradingView.vue'
import ResultView from '@/views/ResultView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/enviar', name: 'upload', component: UploadView },
    { path: '/gerando', name: 'generating', component: GeneratingView },
    { path: '/quiz', name: 'quiz', component: QuizView },
    { path: '/corrigindo', name: 'grading', component: GradingView },
    { path: '/resultado', name: 'result', component: ResultView },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

export default router