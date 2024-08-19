import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/logicflow',
      name: 'logicflow',
      component: () => import('../views/LogicFlowView.vue')
    },
    {
      path: '/performance',
      name: 'performance',
      component: () => import('../views/PerformanceNode.vue')
    },
    {
      path: '/keep-alive-and-teleport',
      name: 'keepaliveAndTeleport',
      component: () => import('../views/KeepAliveAndTeleport.vue')
    },
    {
      path: '/lf-chart',
      name: 'lfChart',
      component: () => import('../views/LFChartView.vue')
    }
  ]
})

export default router
