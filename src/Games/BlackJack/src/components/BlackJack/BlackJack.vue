<template>
  <div class="blackjack-container">
    <h1>🃏 Blackjack</h1>
    
    <!-- Баланс -->
    <div class="balance" :class="{ 'balance-zero': balance <= 0 }">
      Ваш баланс: <strong>{{ balance }} $</strong>
    </div>
    
    <!-- НЕТ ДЕНЕГ (только если игра не начата И баланс = 0) -->
    <div v-if="balance <= 0 && !gameStarted" class="no-money">
      <div class="no-money-icon"></div>
      <h2>У вас закончились деньги!</h2>
      <p>Пополните баланс, чтобы продолжить играть</p>
      <button @click="showRefillModal = true" class="refill-btn">
        Пополнить баланс
      </button>
    </div>
    
    <!-- ЭКРАН СТАВКИ (только если есть деньги И игра не начата) -->
    <div v-else-if="balance >= 10 && !gameStarted" class="bet-section">
      <h2>Сделайте ставку</h2>
      <div class="bet-control">
        <input type="number" v-model.number="betAmount" :min="10" :max="balance">
        <button @click="placeBet(betAmount)" :disabled="betAmount < 10 || betAmount > balance">
          Сделать ставку {{ betAmount }} $
        </button>
      </div>
      <div class="quick-bets">
        <button @click="setBet(10)">10$</button>
        <button @click="setBet(50)">50$</button>
        <button @click="setBet(100)">100$</button>
        <button @click="setBet(500)" :disabled="balance < 500">500$</button>
        <button @click="setBet(balance)" :disabled="balance < 10" class="all-in">
          ВСЁ! ({{ balance }} $)
        </button>
      </div>
    </div>
    
    <!-- ЭКРАН "МАЛО ДЕНЕГ" (меньше 10 но больше 0) -->
    <div v-else-if="balance > 0 && balance < 10 && !gameStarted" class="low-money">
      <div class="low-money-icon">⚠️</div>
      <h2>Недостаточно средств</h2>
      <p>Минимальная ставка 10$</p>
      <button @click="showRefillModal = true" class="refill-btn">
        Пополнить баланс
      </button>
    </div>
    
    <!-- ИГРОВОЕ ПОЛЕ -->
    <div v-else-if="gameStarted" class="game-section">
      <!-- Дилер -->
      <div class="dealer-area">
        <h3>Дилер <span v-if="gameStatus !== 'playing' && gameStatus !== 'bet'">({{ dealerScore }})</span></h3>
        <div class="cards">
          <Card 
            v-for="(card, idx) in dealerCards" 
            :key="idx"
            :card="card"
            :hidden="idx === 1 && gameStatus === 'playing'"
          />
        </div>
      </div>
      
      <!-- Игрок -->
      <div class="player-area">
        <h3>Вы ({{ playerScore }})</h3>
        <div class="cards">
          <Card 
            v-for="(card, idx) in playerCards" 
            :key="idx"
            :card="card"
            :hidden="false"
          />
        </div>
      </div>
      
      <!-- Кнопки действий -->
      <div class="actions" v-if="gameStatus === 'playing'">
        <button @click="hit" class="hit">🎴 Взять (Hit)</button>
        <button @click="stand" class="stand">✋ Хватит (Stand)</button>
      </div>
      
      <!-- Результат -->
      <div v-else class="result">
        <div v-if="gameStatus === 'playerBust'" class="lose">
          Перебор! Вы проиграли {{ currentBet }} $
        </div>
        <div v-else-if="gameStatus === 'dealerBust'" class="win">
          У дилера перебор! Вы выиграли {{ currentBet }} $
        </div>
        <div v-else-if="gameStatus === 'playerWin'" class="win">
          Вы выиграли {{ currentBet }} $!
        </div>
        <div v-else-if="gameStatus === 'dealerWin'" class="lose">
          Дилер выиграл. Вы проиграли {{ currentBet }} $
        </div>
        <div v-else-if="gameStatus === 'push'" class="push">
          Ничья! Ставка возвращена
        </div>
        
        <button @click="playAgainBtn" class="play-again">
          Сыграть ещё
        </button>
      </div>
    </div>
    
    <!-- Кнопка сброса баланса (всегда видна, если не в игре) -->
    <button @click="showResetModal = true" class="reset-btn" v-if="!gameStarted">
      Сбросить баланс
    </button>
    
    <!-- Модалка: сброс баланса -->
    <Modal 
      v-model="showResetModal"
      title="Сброс баланса"
      type="confirm"
      @confirm="resetBalance"
    >
      Вы уверены, что хотите сбросить баланс до 1000$?
    </Modal>
    
    <!-- Модалка: пополнение баланса -->
    <Modal 
      v-model="showRefillModal"
      title="Пополнение баланса"
      type="confirm"
      @confirm="refillBalance"
    >
      Пополнить баланс на 1000$?
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBlackjack } from '../../composables/useBlackjack.js'
import Card from './Card.vue'
import Modal from './Modal.vue'

// Подключаем логику
const {
  balance,
  currentBet,
  playerCards,
  dealerCards,
  playerScore,
  dealerScore,
  gameStatus,
  gameStarted,
  placeBet: originalPlaceBet,
  hit,
  stand,
  playAgain,
  resetBalance: originalResetBalance
} = useBlackjack()

// Локальные переменные
const betAmount = ref(50)
const showResetModal = ref(false)
const showRefillModal = ref(false)

// Установка ставки
function setBet(amount) {
  if (amount > balance.value) {
    betAmount.value = balance.value
  } else {
    betAmount.value = amount
  }
}

// Сделать ставку
function placeBet(amount) {
  if (originalPlaceBet(amount)) {
    betAmount.value = amount
  }
}

// Сброс баланса
function resetBalance() {
  originalResetBalance()
  showResetModal.value = false
}

// Пополнение баланса
function refillBalance() {
  balance.value = 1000
  showRefillModal.value = false
  originalResetBalance()
}

// Кнопка "Сыграть ещё"
function playAgainBtn() {
  playAgain()
}
</script>

<style scoped>
.blackjack-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #1a4d2a;
  border-radius: 20px;
  color: white;
  text-align: center;
  font-family: Arial, sans-serif;
}

.balance {
  background: gold;
  color: black;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: bold;
}

.balance-zero {
  background: #ff5722;
  color: white;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.no-money, .low-money {
  background: #2d2d2d;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
}

.no-money-icon, .low-money-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.no-money h2, .low-money h2 {
  color: #ff5722;
  margin-bottom: 10px;
}

.no-money p, .low-money p {
  margin-bottom: 20px;
  color: #ccc;
}

.refill-btn {
  background: gold;
  color: black;
  padding: 12px 30px;
  font-size: 18px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
}

.refill-btn:hover {
  background: #ffc107;
}

.bet-section {
  background: #2d6a3b;
  padding: 20px;
  border-radius: 15px;
}

.bet-control input {
  padding: 10px;
  font-size: 18px;
  width: 150px;
  text-align: center;
  margin: 10px;
  border-radius: 10px;
  border: none;
}

.bet-control button, .quick-bets button {
  background: gold;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.bet-control button:hover, .quick-bets button:hover {
  background: #ffc107;
}

.all-in {
  background: #ff5722 !important;
  color: white !important;
}

.all-in:disabled {
  background: #666 !important;
  cursor: not-allowed;
}

.dealer-area, .player-area {
  background: #2d6a3b;
  padding: 20px;
  border-radius: 15px;
  margin: 15px 0;
}

.cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
}

.actions button {
  padding: 12px 30px;
  margin: 10px;
  font-size: 18px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
}

.hit {
  background: #ff9800;
  color: white;
}

.hit:hover {
  background: #e68900;
}

.stand {
  background: #f44336;
  color: white;
}

.stand:hover {
  background: #d32f2f;
}

.result {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0,0,0,0.5);
  border-radius: 15px;
}

.win { 
  color: #a5d6a7; 
  font-size: 24px; 
  font-weight: bold;
}

.lose { 
  color: #ffcdd2; 
  font-size: 24px;
  font-weight: bold;
}

.push { 
  color: #fff9c4; 
  font-size: 24px;
  font-weight: bold;
}

.play-again {
  background: #2196f3;
  color: white;
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
}

.play-again:hover {
  background: #1976d2;
}

.reset-btn {
  background: #ff5722;
  color: white;
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
}

.reset-btn:hover {
  background: #e64a19;
}
</style>