<template>
  <div class="sausage-game">
    <div class="game-container">
      <div class="game-header">
        <div class="balance-box">
          <span class="label">БАЛАНС</span>
          <span class="value">{{ balance }} ₽</span>
        </div>
        <div class="multiplier-box" :class="{ high: currentStep >= 3 }">
          <span class="label">ТЕКУЩИЙ ВЫИГРЫШ</span>
          <span class="value">{{ currentWinAmount }} ₽</span>
        </div>
        <div class="current-bet-box">
          <span class="label">СТАВКА</span>
          <span class="value">{{ currentBet }} ₽</span>
        </div>
      </div>
      
      <div class="game-arena">
        <div class="water-bg"></div>
        
        <div class="plates-grid">
          <div 
            v-for="row in 5" 
            :key="'row-' + row"
            class="plate-row">
            <div 
              v-for="col in 5" 
              :key="'col-' + col"
              class="plate-cell"
              :class="{
                'active': currentRow === row && currentCol === col,
                'visited': visitedCells.some(cell => cell.row === row && cell.col === col),
                'can-jump': canJumpTo(row, col),
                'disabled': gameEnded || isJumping
              }"
              @click="jumpTo(row, col)"
            >
              <img src="../../../img/Tarelka.png" alt="plate" class="plate-icon" />
              <div class="plate-step">{{ getMultiplier(row) }}</div>
            </div>
          </div>
        </div>
        
        <div class="sausage-wrapper" :class="{ jumping: isJumping }">
          <div class="sausage" :style="sausagePositionStyle">
            <img src="../../../img/Sausage.png" alt="sausage" class="sausage-icon" />
          </div>
        </div>
        
        <img 
          v-if="showWinGif" 
          src="../../../img/WinGame.gif" 
          alt="win" 
          class="effect-gif win-gif"
        />
        <img 
          v-if="showLoseGif" 
          src="../../../img/LostGame.gif" 
          alt="lose" 
          class="effect-gif lose-gif"
        />
        
        <div v-if="showWinEffect" class="win-effect">+{{ lastWinAmount }} ₽</div>
        <div v-if="showLoseEffect" class="lose-effect">ВЫ ПРОИГРАЛИ! ТАРЕЛКА БЫЛА ОПАСНОЙ!</div>
      </div>
      
      <div class="game-controls">
        <div class="bet-buttons">
          <button 
            v-for="amount in [50,100,250,500]" 
            :key="amount" 
            @click="setBet(amount)" 
            class="bet-btn"
            :class="{ active: currentBet === amount && !isCustomBet }"
          >
            {{ amount }}
          </button>
          <button @click="setBet(balance)" class="bet-btn max">MAX</button>
          
          <!-- Кастомная ставка -->
          <div class="custom-bet-wrapper">
            <input 
              type="number" 
              v-model.number="customBetAmount" 
              @input="setCustomBet"
              placeholder="Своя"
              min="1"
              :max="balance"
              class="custom-bet-input"
              :disabled="hasStarted || gameEnded"
            />
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            @click="cashOut" 
            :disabled="isJumping || gameEnded || !hasStarted" 
            class="cashout-btn"
          >
            ЗАБРАТЬ ({{ currentWinAmount }} ₽)
          </button>
          <button 
            @click="resetGame" 
            :disabled="isJumping" 
            class="reset-btn"
          >
            НОВАЯ ИГРА
          </button>
        </div>
      </div>
      
      <div class="info">
        Кликай на тарелку, чтобы прыгнуть!
        Каждый прыжок УДВАИВАЕТ твой выигрыш!
        В каждом ряду разное количество безопасных тарелок!
        Выбери неправильную — проиграешь всё!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const balance = ref(1000)
const storageKey = 'casino_balance'

const loadBalance = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'number') balance.value = parsed
    } catch (e) {}
  }
}

const saveBalance = () => {
  localStorage.setItem(storageKey, JSON.stringify(balance.value))
}

const addBalance = (amount) => {
  balance.value += amount
  saveBalance()
}

const syncBalance = () => {
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'number') balance.value = parsed
    } catch (e) {}
  }
}

const currentBet = ref(100)
const currentStep = ref(0)
const currentWinAmount = ref(0)
const currentRow = ref(5)
const currentCol = ref(3)
const visitedCells = ref([])
const hasStarted = ref(false)
const isJumping = ref(false)
const gameEnded = ref(false)
const showWinEffect = ref(false)
const showLoseEffect = ref(false)
const showWinGif = ref(false)
const showLoseGif = ref(false)
const lastWinAmount = ref(0)

// Кастомная ставка
const customBetAmount = ref(null)
const isCustomBet = ref(false)

const dangerousPlates = ref({
  4: [],
  3: [],
  2: [],
  1: []
})

const safePlatesCount = computed(() => {
  if (currentRow <= 1) return 1
  const dangerous = dangerousPlates.value[currentRow - 1] || []
  return 5 - dangerous.length
})

const generateDangerousPlates = (row, safeCount) => {
  const allCols = [1, 2, 3, 4, 5]
  const safeCols = []
  const dangerous = []
  
  while (safeCols.length < safeCount && allCols.length > 0) {
    const randomIndex = Math.floor(Math.random() * allCols.length)
    const col = allCols[randomIndex]
    safeCols.push(col)
    allCols.splice(randomIndex, 1)
  }
  
  dangerous.push(...allCols)
  return dangerous
}

const initDangerousPlates = () => {
  dangerousPlates.value[4] = generateDangerousPlates(4, 4)
  dangerousPlates.value[3] = generateDangerousPlates(3, 3)
  dangerousPlates.value[2] = generateDangerousPlates(2, 2)
  dangerousPlates.value[1] = generateDangerousPlates(1, 1)
}

const isDangerous = (row, col) => {
  if (row === 5) return false
  const dangerous = dangerousPlates.value[row]
  if (!dangerous) return false
  return dangerous.includes(col)
}

const canJumpTo = (row, col) => {
  if (gameEnded.value || isJumping.value) return false
  if (visitedCells.value.some(cell => cell.row === row && cell.col === col)) return false
  if (row !== currentRow.value - 1) return false
  return true
}

const jumpTo = async (row, col) => {
  if (!canJumpTo(row, col)) return
  
  syncBalance()
  
  if (!hasStarted.value) {
    if (currentBet.value > balance.value) {
      alert('Недостаточно средств!')
      return
    }
    hasStarted.value = true
    balance.value -= currentBet.value
    saveBalance()
    
    currentWinAmount.value = currentBet.value * 2
    currentStep.value = 1
  } else {
    currentWinAmount.value = currentWinAmount.value * 2
    currentStep.value++
  }
  
  // Проверяем опасность после списания
  if (isDangerous(row, col)) {
    finishGame(false, 0)
    return
  }
  
  isJumping.value = true
  
  setTimeout(() => {
    currentRow.value = row
    currentCol.value = col
    visitedCells.value.push({ row, col, step: currentStep.value })
    
    setTimeout(() => {
      isJumping.value = false
      
      if (row === 1) {
        finishGame(true, currentWinAmount.value)
      }
    }, 50)
  }, 200)
}

const cashOut = () => {
  if (!hasStarted.value) {
    alert('Сначала сделайте прыжок!')
    return
  }
  if (isJumping.value || gameEnded.value) return
  finishGame(true, currentWinAmount.value)
}

const finishGame = (isWin, winAmount) => {
  if (gameEnded.value) return
  gameEnded.value = true
  isJumping.value = false
  
  if (isWin) {
    lastWinAmount.value = winAmount
    addBalance(winAmount)
    showWinEffect.value = true
    showWinGif.value = true
    setTimeout(() => { 
      showWinEffect.value = false
      showWinGif.value = false
    }, 2500)
  } else {
    showLoseEffect.value = true
    showLoseGif.value = true
    setTimeout(() => { 
      showLoseEffect.value = false
      showLoseGif.value = false
    }, 2500)
  }
}

const resetGame = () => {
  if (isJumping.value) return
  
  // Перезагружаем баланс из localStorage
  syncBalance()
  
  currentRow.value = 5
  currentCol.value = 3
  currentStep.value = 0
  currentWinAmount.value = 0
  visitedCells.value = []
  hasStarted.value = false
  gameEnded.value = false
  isJumping.value = false
  showWinEffect.value = false
  showLoseEffect.value = false
  showWinGif.value = false
  showLoseGif.value = false
  isCustomBet.value = false
  customBetAmount.value = null
  
  visitedCells.value.push({ row: 5, col: 3, step: 0 })
  initDangerousPlates()
}

const setBet = (amount) => {
  syncBalance()
  
  if (!hasStarted.value && !isJumping.value && !gameEnded.value) {
    currentBet.value = Math.min(amount, balance.value)
    isCustomBet.value = false
    customBetAmount.value = null
  }
}

const setCustomBet = () => {
  syncBalance()
  
  if (hasStarted.value || gameEnded.value) return
  if (customBetAmount.value && customBetAmount.value > 0) {
    let amount = customBetAmount.value
    if (amount > balance.value) amount = balance.value
    currentBet.value = amount
    isCustomBet.value = true
    customBetAmount.value = amount
  }
}

const getStepNumber = (row) => {
  return 6 - row
}

const getMultiplier = (row) => {
  if (row === 5) return 'СТАРТ'
  const step = 6 - row  
  const multiplier = Math.pow(2, step - 1)  
  return `x${multiplier}`
}

const sausagePositionStyle = computed(() => {
  const colWidth = 100 / 5
  const rowHeight = 100 / 5
  const left = (currentCol.value - 0.5) * colWidth
  const top = (currentRow.value - 0.5) * rowHeight
  return { 
    left: `${left}%`, 
    top: `${top}%`,
    position: 'absolute'
  }
})

onMounted(() => {
  loadBalance()
  initDangerousPlates()
  resetGame()
})
</script>

<style scoped>
.sausage-game {
  min-height: 100vh;
  background: #0a0a1a;
  padding: 20px;
}

.game-container {
  max-width: 800px;
  margin: 0 auto;
}

.game-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.balance-box, .multiplier-box, .current-bet-box {
  background: #1a1a2e;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 12px;
  text-align: center;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.label {
  display: block;
  font-size: 0.7rem;
  color: #aaa;
  letter-spacing: 2px;
}

.value {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffd700;
}

.multiplier-box.high .value {
  color: #ff6600;
  text-shadow: 0 0 5px rgba(255,102,0,0.5);
}

.game-arena {
  position: relative;
  background: #0a3a4a;
  border-radius: 30px;
  width: 100%;
  aspect-ratio: 1 / 1;
  margin-bottom: 20px;
  overflow: hidden;
  border: 3px solid #ffd700;
}

.water-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background:  #3445df90;
}

.plates-grid {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 5%;
}

.plate-row {
  display: flex;
  flex: 1;
}

.plate-cell {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 5px;
  background: rgba(94, 43, 121, 0.7);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(5px);
}

.plate-cell:hover:not(.disabled) {
  background: rgb(37, 1, 70);
  transform: scale(1.02);
  border-color: #ffd700;
}

.plate-cell.active {
  background: rgba(255, 215, 0, 0.3);
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.plate-cell.visited {
  background: rgb(38, 2, 77);
  border-color: rgba(255, 215, 0, 0.5);
  cursor: default;
}

.plate-cell.visited .plate-icon {
  opacity: 0.5;
}

.plate-cell.can-jump {
  background: rgba(71, 7, 103, 0.664);
  border-color: #49031b;
  animation: pulseGreen 1s infinite;
}

.plate-cell.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.plate-icon {
  width: 130px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 5px;
}

.plate-step {
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff200;
  background: rgba(0,0,0,0.5);
  padding: 2px 8px;
  border-radius: 20px;
}

.sausage-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 15;
}

.sausage {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: left 0.25s ease, top 0.25s ease;
  filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sausage-icon {
  width: 70px;
  height: 70px;
  object-fit: contain;
  display: block;
  transform: rotate(-15deg);
}

.sausage-wrapper.jumping .sausage {
  animation: bounce 0.25s ease;
}


.effect-gif {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: auto;
  z-index: 25;
  pointer-events: none;
  border-radius: 20px;
}

.win-gif {
  animation: fadeOut 3.5s forwards;
}

.lose-gif {
  animation: fadeOut 3.5s forwards;
}

.win-effect, .lose-effect {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.85);
  font-size: 1.2rem;
  font-weight: bold;
  padding: 15px 25px;
  border-radius: 60px;
  animation: fadeOut 2.5s forwards;
  white-space: nowrap;
  z-index: 26;
  text-align: center;
  border: 2px solid;
}

.win-effect {
  color: #ff0055;
  border-color: #ff0055;
}

.lose-effect {
  color: #ff0055;
  border-color: #ff0055;
}

.game-controls {
  background: #1a1a2e;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 15px;
  margin-bottom: 15px;
}

.bet-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.bet-btn {
  background: #2a2a4a;
  color: #ffd700;
  border: 1px solid rgba(255,215,0,0.3);
  padding: 8px 20px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.bet-btn.active {
  background: #ffd700;
  color: #1a1a1a;
}

.bet-btn.max {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #1a1a1a;
}

.custom-bet-wrapper {
  display: inline-block;
}

.custom-bet-input {
  background: #2a2a4a;
  color: #ffd700;
  border: 1px solid rgba(255,215,0,0.3);
  padding: 8px 12px;
  border-radius: 30px;
  font-weight: bold;
  width: 80px;
  text-align: center;
  font-size: 0.9rem;
}

.custom-bet-input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 5px rgba(255,215,0,0.5);
}

.custom-bet-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.cashout-btn, .reset-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 40px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.cashout-btn {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #1a1a1a;
  box-shadow: 0 4px 0 #aa6f20;
}

.cashout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #aa6f20;
}

.cashout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  background: linear-gradient(135deg, #dc3545, #a01c2a);
  color: white;
  box-shadow: 0 4px 0 #6a1020;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #6a1020;
}

.info {
  background: #1a1a2e;
  border-radius: 15px;
  padding: 12px;
  text-align: center;
  color: #ccc;
  font-size: 0.8rem;
  line-height: 1.4;
}

</style>