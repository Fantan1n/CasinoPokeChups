<template>
  <header class="header">
    <div class="container">
      <div class="logo" @click="$router.push('/')">
        <span class="title">PokeChups.money</span>
      </div>
      
      <nav>
        <RouterLink to="/" class="nav-link">Главная</RouterLink>
        <RouterLink to="/sausage" class="nav-link">Sausage Game</RouterLink>
        <RouterLink to="/roulette" class="nav-link">Рулетка</RouterLink>
        <RouterLink to="/blackjack" class="nav-link">BlackJack</RouterLink>
      </nav>
      
      <div class="user-info">
        <div class="balance-display">
          <span class="balance-amount">{{ displayBalance }} ₽</span>
        </div>
        <RouterLink to="/deposit" class="deposit-link">
          <button class="deposit-header-btn">Пополнить</button>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const balance = ref(1000)
const displayBalance = ref(1000)

const updateBalance = () => {
  const saved = localStorage.getItem('casino_balance')
  if (saved) {
    try {
      balance.value = JSON.parse(saved)
      displayBalance.value = Math.floor(balance.value)
    } catch (e) {}
  }
}

let interval = null

onMounted(() => {
  updateBalance()
  interval = setInterval(updateBalance, 500)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.header {
  background: #0f0f1a;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  margin: 10px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
  cursor: pointer;
}

nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: rgba(255, 215, 0, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.balance-display {
  background: #1a1a2e;
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.balance-amount {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.1rem;
}

.deposit-header-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.deposit-header-btn:hover {
  transform: scale(1.05);
  background: #218838;
}
</style>