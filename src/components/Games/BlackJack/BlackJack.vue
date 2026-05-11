<template>
  <div class="blackjack-container">
    <div class="balance">
      Ваш баланс: <strong>{{ balance }} ₽</strong>
    </div>
    
    <div v-if="!gameStarted && balance >= 0" class="bet-section">
      <h2>Сделайте ставку</h2>
      <div class="bet-control">
        <input type="number" v-model.number="betAmount" :min="10" :max="balance" placeholder="Сумма ставки">
        <button @click="placeBet(betAmount)" :disabled="betAmount < 10 || betAmount > balance">
          Сделать ставку {{ betAmount }} ₽
        </button>
      </div>
      <div class="quick-bets">
        <button @click="setBet(10)">10 ₽</button>
        <button @click="setBet(50)">50 ₽</button>
        <button @click="setBet(100)">100 ₽</button>
        <button @click="setBet(500)" :disabled="balance < 500">500 ₽</button>
        <button @click="setBet(balance)" :disabled="balance < 10" class="all-in">
          ВСЁ! ({{ balance }} ₽)
        </button>
      </div>
      <div v-if="balance < 10" class="warning-message">
        Минимальная ставка 10 ₽. Пополните баланс через главное меню.
      </div>
    </div>
    
    <div v-if="gameStarted" class="game-section">
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
      
      <div class="actions" v-if="gameStatus === 'playing'">
        <button @click="hit" class="hit">Взять</button>
        <button @click="stand" class="stand">Хватит</button>
      </div>
      
      <div v-else class="result">
        <div v-if="gameStatus === 'playerBust'" class="lose">
          Перебор! Вы проиграли {{ currentBet }} ₽
        </div>
        <div v-else-if="gameStatus === 'dealerBust'" class="win">
          У дилера перебор! Вы выиграли {{ currentBet }} ₽
        </div>
        <div v-else-if="gameStatus === 'playerWin'" class="win">
          Вы выиграли {{ currentBet }} ₽!
        </div>
        <div v-else-if="gameStatus === 'dealerWin'" class="lose">
          Дилер выиграл. Вы проиграли {{ currentBet }} ₽
        </div>
        <div v-else-if="gameStatus === 'push'" class="push">
          Ничья! Ставка возвращена
        </div>
        
        <button @click="playAgainBtn" class="play-again">
          Сыграть ещё
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from './Card.vue'

const router = useRouter()
const STORAGE_KEY = 'casino_balance'

const balance = ref(1000)
const betAmount = ref(50)
const gameStatus = ref('bet')
const currentBet = ref(0)
const deckCards = ref([])
const playerCards = ref([])
const dealerCards = ref([])

const playerScore = computed(() => calculateScore(playerCards.value))
const dealerScore = computed(() => calculateScore(dealerCards.value))
const gameStarted = computed(() => gameStatus.value !== 'bet')

const loadBalance = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'number') balance.value = parsed
    } catch (e) {}
  }
}

const saveBalance = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(balance.value))
}

const createDeck = () => {
  const suits = ['♥', '♦', '♣', '♠']
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  let deck = []
  for (let i = 0; i < 6; i++) {
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value })
      }
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

const calculateScore = (cards) => {
  let score = 0
  let aces = 0
  for (let card of cards) {
    if (card.value === 'A') {
      aces++
      score += 11
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      score += 10
    } else {
      score += parseInt(card.value)
    }
  }
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}

const drawCard = () => {
  if (deckCards.value.length === 0) {
    deckCards.value = createDeck()
  }
  return deckCards.value.pop()
}

const setBet = (amount) => {
  if (amount > balance.value) {
    betAmount.value = balance.value
  } else {
    betAmount.value = amount
  }
}

const placeBet = (amount) => {
  if (amount > balance.value) return false
  if (amount < 10) return false
  if (balance.value <= 0) return false

  currentBet.value = amount
  balance.value -= amount
  saveBalance()

  deckCards.value = createDeck()
  playerCards.value = []
  dealerCards.value = []
  playerCards.value.push(drawCard())
  playerCards.value.push(drawCard())
  dealerCards.value.push(drawCard())
  dealerCards.value.push(drawCard())

  gameStatus.value = 'playing'

  if (playerScore.value === 21) {
    gameStatus.value = 'playerWin'
    balance.value += currentBet.value * 2
    saveBalance()
  }

  return true
}

const hit = () => {
  if (gameStatus.value !== 'playing') return

  playerCards.value.push(drawCard())

  if (playerScore.value > 21) {
    gameStatus.value = 'playerBust'
  }
}

const stand = () => {
  if (gameStatus.value !== 'playing') return

  while (dealerScore.value < 17) {
    dealerCards.value.push(drawCard())
  }

  if (dealerScore.value > 21) {
    gameStatus.value = 'dealerBust'
    balance.value += currentBet.value * 2
    saveBalance()
  } else if (playerScore.value > dealerScore.value) {
    gameStatus.value = 'playerWin'
    balance.value += currentBet.value * 2
    saveBalance()
  } else if (playerScore.value < dealerScore.value) {
    gameStatus.value = 'dealerWin'
  } else {
    gameStatus.value = 'push'
    balance.value += currentBet.value
    saveBalance()
  }
}

const playAgainBtn = () => {
  gameStatus.value = 'bet'
  playerCards.value = []
  dealerCards.value = []
  deckCards.value = []
  currentBet.value = 0
}

const goToDeposit = () => {
  router.push('/deposit')
}

let refreshInterval = null

onMounted(() => {
  loadBalance()
  refreshInterval = setInterval(loadBalance, 500)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
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
}

.balance {
  background: #ffd700;
  color: black;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: bold;
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
  background: #ffd700;
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

.warning-message {
  margin-top: 15px;
  padding: 10px;
  background: rgba(0,0,0,0.7);
  border-radius: 10px;
  color: #ffd700;
  font-size: 14px;
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
</style>