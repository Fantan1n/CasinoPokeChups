<template>
  <div class="deposit-page">
    <div class="deposit-container">
      <div class="deposit-header">
        <div class="icon"></div>
        <h1>Пополнение баланса</h1>
        <p class="current-balance">
          Текущий баланс: <strong>{{ balance }} ₽</strong>
        </p>
      </div>
      
      <div class="deposit-form">
        <div class="preset-buttons">
          <button 
            v-for="amount in presetAmounts" 
            :key="amount"
            @click="selectedAmount = amount"
            :class="{ active: selectedAmount === amount }"
          >
            +{{ amount }} ₽
          </button>
        </div>
        
        <div class="custom-amount">
          <label>Своя сумма:</label>
          <input 
            type="number" 
            v-model.number="customAmount" 
            placeholder="1000"
            min="1"
          />
        </div>
        
        <button 
          class="deposit-btn" 
          @click="processDeposit"
          :disabled="depositAmount <= 0"
        >
          Пополнить на {{ depositAmount }} ₽
        </button>
      </div>
      
      <div class="info-text">
        <div class="info-item">Безопасные платежи</div>
        <div class="info-item">Мгновенное зачисление</div>
        <div class="info-item">Бонус 100% за первое пополнение</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const balance = ref(1000)
const presetAmounts = [100, 500, 1000, 5000]
const selectedAmount = ref(null)
const customAmount = ref(null)

const depositAmount = computed(() => {
  if (selectedAmount.value) return selectedAmount.value
  if (customAmount.value && customAmount.value > 0) return customAmount.value
  return 0
})

const loadBalance = () => {
  const saved = localStorage.getItem('casino_balance')
  if (saved) {
    try {
      balance.value = JSON.parse(saved)
    } catch (e) {}
  }
}

const processDeposit = () => {
  if (depositAmount.value <= 0) return
  
  const newBalance = balance.value + depositAmount.value
  balance.value = newBalance
  localStorage.setItem('casino_balance', JSON.stringify(newBalance))
  
  alert(`Баланс пополнен на ${depositAmount.value} ₽!\nНовый баланс: ${newBalance} ₽`)
  
  selectedAmount.value = null
  customAmount.value = null
  
  setTimeout(() => {
    router.push('/')
  }, 1000)
}

onMounted(() => {
  loadBalance()
})
</script>

<style scoped>
.deposit-page {
  min-height: calc(100vh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #0a0a1a;
}

.deposit-container {
  max-width: 600px;
  width: 100%;
  background: #1a1a2e;
  border-radius: 30px;
  padding: 40px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.deposit-header {
  text-align: center;
  margin-bottom: 30px;
}

.deposit-header .icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.deposit-header h1 {
  color: #ffd700;
  font-size: 2rem;
  margin-bottom: 10px;
}

.current-balance {
  font-size: 1.2rem;
  color: #ccc;
}

.current-balance strong {
  color: #ffd700;
  font-size: 1.5rem;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.preset-buttons button {
  background: #2a2a4a;
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 12px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-buttons button:hover {
  background: #3a3a5a;
  transform: translateY(-2px);
}

.preset-buttons button.active {
  background: #ffd700;
  color: #1a1a1a;
  border-color: #ffd700;
}

.custom-amount {
  margin-bottom: 25px;
}

.custom-amount label {
  display: block;
  color: #ccc;
  margin-bottom: 8px;
}

.custom-amount input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  background: #0a0a1a;
  color: white;
  font-size: 1.1rem;
  text-align: center;
}

.deposit-btn {
  width: 100%;
  background: #ffd700;
  color: #1a1a1a;
  border: none;
  padding: 16px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.deposit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
}

.deposit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-text {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  font-size: 0.8rem;
  color: #888;
}
</style>