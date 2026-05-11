import { createRouter, createWebHistory } from 'vue-router'
import Blackjack from './components/BlackJack/BlackJack.vue'

// Потом добавите игры друзей
const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Blackjack,
    meta: { title: 'Blackjack - Казино' }
  },
  { 
    path: '/blackjack', 
    name: 'Blackjack', 
    component: Blackjack,
    meta: { title: 'Blackjack - Игра' }
  },
  // Позже добавите:
  // { path: '/roulette', name: 'Roulette', component: Roulette },
  // { path: '/frog', name: 'FrogJump', component: FrogJump },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Защита маршрутов (из вашего урока про мета-теги)
router.beforeEach((to, from, next) => {
  document.title = to.meta?.title || 'Казино'
  next()
})

export default router