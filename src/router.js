import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/HomePage.vue'
import SausageGame from './components/Games/Sausage/SausageGame.vue'
import RouletteGame from './components/Games/Roulette/RouletteGame.vue'
import BlackJackGame from './components/Games/BlackJack/BlackJack.vue'
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
    path: '/roulette',
    name: 'Roulette',
    component: RouletteGame
  },
  {
    path: '/blackjack',
    name: 'BlackJack',
    component: BlackJackGame
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