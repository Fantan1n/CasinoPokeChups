import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/HomePage.vue'
import SausageGame from './components/Sausage/SausageGame.vue'
import DepositPage from './components/DepositPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/sausage',
    name: 'Sausage',
    component: SausageGame
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: DepositPage
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})