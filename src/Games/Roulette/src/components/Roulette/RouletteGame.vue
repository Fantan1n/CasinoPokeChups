<template>
  <div class="roulette-view">
    <div class="roulette-game">
      <!-- Верхняя часть: рулетка -->
      <div class="slot-section">
        <RouletteSlot 
          :isSpinning="isSpinning"
          :allNumbers="allNumbers"
          @stop="onSpinStop"
        />
      </div>
      
      <!-- Блок ставок и кнопка крутить -->
      <div class="bet-and-spin">
        <div class="bet-panel-compact">
          <div class="balance-compact">{{ balance }} ₽</div>
          
          <div class="quick-bets-compact">
            <button v-for="amount in [50,100,250,500]" :key="amount" @click="setBetAmount(amount)" class="quick-bet-compact">
              +{{ amount }}
            </button>
            <button @click="setBetAmount(balance)" class="quick-bet-compact max">MAX</button>
          </div>
          
          <div class="bet-input-compact">
            <button @click="decrementBet" class="adjust-btn" :disabled="isSpinning">−</button>
            <input type="number" v-model.number="localBetAmount" min="1" :max="balance" :disabled="isSpinning"/>
            <button @click="incrementBet" class="adjust-btn" :disabled="isSpinning">+</button>
          </div>
          
          <div class="selected-bet-compact" v-if="selectedBet">
            {{ formatBet(selectedBet) }}
          </div>
          <div class="selected-bet-compact no-bet" v-else>
            Нажмите на поле
          </div>
        </div>
        
        <button 
          class="spin-btn-main" 
          @click="onSpinFromBottom"
          :disabled="!isBetValid || isSpinning"
        >
          <span v-if="!isSpinning">КРУТИТЬ</span>
          <span v-else>КРУТИТСЯ...</span>
        </button>
      </div>
      
      <!-- Всплывающее сообщение о результате -->
      <div v-if="showResultMessage" class="result-popup" :class="resultMessageType">
        <div class="result-number" :class="resultNumberColor">{{ lastResultNumber }}</div>
        <div class="result-amount">{{ resultMessageText }}</div>
      </div>
      
      <!-- Игровое поле -->
      <div class="board-container">
        <RouletteBoard @placeBet="onPlaceBet" />
      </div>
    </div>
    
    <!-- История -->
    <div class="history-fixed">
      <div class="history-header">
        <h3>История</h3>
        <button class="history-toggle" @click="showHistory = !showHistory">−</button>
      </div>
      <div class="history-list" v-show="showHistory">
        <div v-for="(item, idx) in history.slice(0, 15)" :key="idx" class="history-item">
          <div class="history-number-wrapper">
            <span class="history-number-label">Выпало:</span>
            <span class="history-number" :class="item.winColor">{{ item.winNumber }}</span>
          </div>
          <div class="history-result" :class="{ win: item.isWin, lose: !item.isWin }">
            {{ item.isWin ? `+${item.winAmount - item.amount}` : `-${item.amount}` }} ₽
          </div>
          <div class="history-bet">{{ formatHistoryBet(item) }}</div>
        </div>
        <div v-if="history.length === 0" class="empty">Нет игр</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import useRoulette from '../../composables/useRoulette'
import RouletteSlot from './RouletteSlot.vue'
import RouletteBoard from './RouletteBoard.vue'

const { balance, lastResult, history, isSpinning, allNumbers, finalizeSpin, getColor } = useRoulette()

const localBetAmount = ref(100)
const selectedBet = ref(null)
let currentBetData = null
const showHistory = ref(true)

// Всплывающее сообщение
const showResultMessage = ref(false)
const resultMessageType = ref('')
const resultMessageText = ref('')
const lastResultNumber = ref(0)
const resultNumberColor = ref('')

const getNumberColor = (num) => {
  if (num === 0) return 'green'
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  return redNumbers.includes(num) ? 'red' : 'black'
}

const formatBet = (bet) => {
  if (!bet) return ''
  if (bet.type === 'number') return `Число ${bet.value}`
  if (bet.type === 'color') return bet.value === 'red' ? 'Красное' : 'Чёрное'
  if (bet.type === 'evenOdd') return bet.value === 'even' ? 'Чётное' : 'Нечётное'
  if (bet.type === 'half') return bet.value === '1-18' ? '1-18' : '19-36'
  if (bet.type === 'dozen') return {1:'1-12',2:'13-24',3:'25-36'}[bet.value]
  return ''
}

const formatHistoryBet = (item) => {
  if (item.betType === 'number') return `Ставка на ${item.betValue}`
  if (item.betType === 'color') return item.betValue === 'red' ? 'Ставка на красное' : 'Ставка на чёрное'
  if (item.betType === 'evenOdd') return item.betValue === 'even' ? 'Ставка на чёт' : 'Ставка на нечёт'
  if (item.betType === 'half') return item.betValue === '1-18' ? 'Ставка 1-18' : 'Ставка 19-36'
  if (item.betType === 'dozen') return {1:'Ставка 1-12',2:'Ставка 13-24',3:'Ставка 25-36'}[item.betValue]
  return ''
}

const setBetAmount = (amount) => {
  if (!isSpinning.value) {
    localBetAmount.value = Math.min(Math.max(1, amount), balance.value)
  }
}

const incrementBet = () => {
  if (!isSpinning.value) {
    localBetAmount.value = Math.min(localBetAmount.value + 50, balance.value)
  }
}

const decrementBet = () => {
  if (!isSpinning.value) {
    localBetAmount.value = Math.max(localBetAmount.value - 50, 1)
  }
}

const setBet = (bet) => {
  if (!isSpinning.value) selectedBet.value = bet
}

const getCurrentBet = () => {
  if (selectedBet.value && localBetAmount.value > 0 && localBetAmount.value <= balance.value && !isSpinning.value) {
    return { type: selectedBet.value.type, value: selectedBet.value.value, amount: localBetAmount.value }
  }
  return null
}

const isBetValid = computed(() => {
  return selectedBet.value !== null && localBetAmount.value > 0 && localBetAmount.value <= balance.value
})

const onPlaceBet = (bet) => {
  if (!isSpinning.value) setBet(bet)
}

const onSpin = async (betData) => {
  if (isSpinning.value) return
  if (betData.amount > balance.value) return
  
  currentBetData = betData
  balance.value -= betData.amount
  isSpinning.value = true
}

const onSpinFromBottom = () => {
  const bet = getCurrentBet()
  if (bet) onSpin(bet)
}

const showResult = (winNumber, isWin, winAmount, betAmount) => {
  lastResultNumber.value = winNumber
  resultNumberColor.value = getNumberColor(winNumber)
  if (isWin) {
    resultMessageType.value = 'win'
    resultMessageText.value = `+${winAmount - betAmount} ₽`
  } else {
    resultMessageType.value = 'lose'
    resultMessageText.value = `-${betAmount} ₽`
  }
  showResultMessage.value = true
  setTimeout(() => {
    showResultMessage.value = false
  }, 2000)
}

const onSpinStop = (winNumber) => {
  if (currentBetData) {
    const result = finalizeSpin(winNumber, currentBetData.type, currentBetData.value, currentBetData.amount)
    showResult(winNumber, result.isWin, result.winAmount, currentBetData.amount)
    currentBetData = null
  }
  isSpinning.value = false
}
</script>

<style scoped>
.roulette-view {
  min-height: 100vh;
  background: #0a0a1a;
  padding: 20px;
  position: relative;
}

.roulette-game {
  max-width: 1000px;
  margin: 0 auto;
}

.slot-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.bet-and-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.bet-panel-compact {
  background: #1a1a2e;
  padding: 12px 20px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.balance-compact {
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffd700;
  background: #0a0a1a;
  padding: 5px 12px;
  border-radius: 30px;
}

.quick-bets-compact {
  display: flex;
  gap: 5px;
}

.quick-bet-compact {
  background: #2a2a4a;
  color: #ffd700;
  border: none;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.8rem;
}

.quick-bet-compact.max {
  background: #ffd700;
  color: #1a1a1a;
}

.bet-input-compact {
  display: flex;
  align-items: center;
  gap: 5px;
}

.bet-input-compact input {
  width: 80px;
  padding: 6px 8px;
  border-radius: 20px;
  border: 1px solid #ffd700;
  background: #0a0a1a;
  color: #ffd700;
  text-align: center;
  font-size: 0.9rem;
}

.adjust-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2a2a4a;
  color: #ffd700;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
}

.selected-bet-compact {
  font-size: 0.85rem;
  color: #ffd700;
  background: #0a0a1a;
  padding: 5px 12px;
  border-radius: 20px;
}

.selected-bet-compact.no-bet {
  color: #aaa;
}

.spin-btn-main {
  background: #ffd700;
  border: none;
  font-size: 1.3rem;
  font-weight: bold;
  padding: 12px 35px;
  border-radius: 60px;
  cursor: pointer;
  box-shadow: 0 4px 0 #aa6f20;
  transition: all 0.07s linear;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.spin-btn-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #aa6f20;
}

.spin-btn-main:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #aa6f20;
}

.spin-btn-main:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Всплывающее сообщение */
.result-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1a1a2e;
  border-radius: 30px;
  padding: 30px 50px;
  text-align: center;
  z-index: 2000;
  animation: fadeInOut 2s forwards;
  border: 2px solid;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
}

.result-popup.win {
  border-color: #ffd700;
  background: linear-gradient(135deg, #1a1a2e, #2a2a4a);
}

.result-popup.lose {
  border-color: #dc3545;
  background: linear-gradient(135deg, #1a1a2e, #3a1a2a);
}

.result-number {
  font-size: 5rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.result-number.red { color: #ff4444; }
.result-number.black { color: #ffffff; }
.result-number.green { color: #00ff00; }

.result-amount {
  font-size: 1.8rem;
  font-weight: bold;
}

.result-popup.win .result-amount {
  color: #ffd700;
}

.result-popup.lose .result-amount {
  color: #ff6666;
}


/* Игровое поле */
.board-container {
  background: #1a1a2e;
  padding: 15px;
  border-radius: 20px;
}

/* История */
.history-fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 260px;
  background: #1a1a2e;
  border-radius: 15px;
  z-index: 1000;
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #2a2a4a;
  border-radius: 15px 15px 0 0;
  cursor: pointer;
}

.history-header h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #ffd700;
}

.history-toggle {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 1.2rem;
  cursor: pointer;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: #0a0a1a;
  border-radius: 10px;
  margin-bottom: 8px;
}

.history-number-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-number-label {
  font-size: 0.7rem;
  color: #888;
}

.history-number {
  font-size: 1.3rem;
  font-weight: bold;
}
.history-number.red { color: #ff4444; }
.history-number.black { color: #ffffff; }
.history-number.green { color: #00ff00; }

.history-result {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  padding: 5px;
  border-radius: 8px;
}

.history-result.win {
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
}

.history-result.lose {
  background: rgba(220, 53, 69, 0.15);
  color: #ff6666;
}

.history-bet {
  font-size: 0.7rem;
  color: #aaa;
  text-align: center;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.8rem;
}

@media (max-width: 700px) {
  .bet-and-spin {
    flex-direction: column;
  }
  
  .bet-panel-compact {
    border-radius: 20px;
    justify-content: center;
  }
  
  .history-fixed {
    display: none;
  }
  
  .spin-btn-main {
    font-size: 1rem;
    padding: 10px 25px;
  }
  
  .result-number {
    font-size: 3rem;
  }
  
  .result-amount {
    font-size: 1.2rem;
  }
  
  .result-popup {
    padding: 20px 30px;
  }
}
</style>