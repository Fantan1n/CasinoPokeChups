<template>
  <div class="roulette-board">
    <div class="betting-table">
      <div class="zero-row">
        <div class="bet-cell zero" :class="{ active: isBetActive('number', 0) }" @click="placeBet('number', 0)">
          0
        </div>
      </div>
      
      <div class="numbers-grid">
        <div class="number-column">
          <div 
            v-for="num in getColumnNumbers(1)" 
            :key="num"
            class="bet-cell number-cell"
            :class="[getNumberColor(num), { active: isBetActive('number', num) }]"
            @click="placeBet('number', num)"
          >
            {{ num }}
          </div>
        </div>
        <div class="number-column">
          <div 
            v-for="num in getColumnNumbers(2)" 
            :key="num"
            class="bet-cell number-cell"
            :class="[getNumberColor(num), { active: isBetActive('number', num) }]"
            @click="placeBet('number', num)"
          >
            {{ num }}
          </div>
        </div>
        <div class="number-column">
          <div 
            v-for="num in getColumnNumbers(3)" 
            :key="num"
            class="bet-cell number-cell"
            :class="[getNumberColor(num), { active: isBetActive('number', num) }]"
            @click="placeBet('number', num)"
          >
            {{ num }}
          </div>
        </div>
      </div>
      
      <div class="special-row">
        <div class="bet-cell special" :class="{ active: isBetActive('half', '1-18') }" @click="placeBet('half', '1-18')">
          1–18
        </div>
        <div class="bet-cell special" :class="{ active: isBetActive('evenOdd', 'even') }" @click="placeBet('evenOdd', 'even')">
          ЧЁТ
        </div>
        <div class="bet-cell special red" :class="{ active: isBetActive('color', 'red') }" @click="placeBet('color', 'red')">
          🔴
        </div>
        <div class="bet-cell special black" :class="{ active: isBetActive('color', 'black') }" @click="placeBet('color', 'black')">
          ⚫
        </div>
        <div class="bet-cell special" :class="{ active: isBetActive('evenOdd', 'odd') }" @click="placeBet('evenOdd', 'odd')">
          НЕЧЁТ
        </div>
        <div class="bet-cell special" :class="{ active: isBetActive('half', '19-36') }" @click="placeBet('half', '19-36')">
          19–36
        </div>
      </div>
      
      <div class="dozen-row">
        <div class="bet-cell dozen" :class="{ active: isBetActive('dozen', 1) }" @click="placeBet('dozen', 1)">
          1-12
        </div>
        <div class="bet-cell dozen" :class="{ active: isBetActive('dozen', 2) }" @click="placeBet('dozen', 2)">
          13-24
        </div>
        <div class="bet-cell dozen" :class="{ active: isBetActive('dozen', 3) }" @click="placeBet('dozen', 3)">
          25-36
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['placeBet'])

const currentBet = ref(null)

const isBetActive = (type, value) => {
  if (!currentBet.value) return false
  return currentBet.value.type === type && currentBet.value.value === value
}

const getNumberColor = (num) => {
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  return redNumbers.includes(num) ? 'red' : 'black'
}

const getColumnNumbers = (column) => {
  const numbers = []
  for (let i = column; i <= 36; i += 3) {
    numbers.push(i)
  }
  return numbers
}

const placeBet = (type, value) => {
  const bet = { type, value }
  currentBet.value = bet
  emit('placeBet', bet)
}
</script>

<style scoped>
.roulette-board {
  background: #0a4a2a;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border: 2px solid #ffd700;
}

.betting-table {
  background: #0a3a1a;
  border-radius: 12px;
  padding: 15px;
}

.zero-row {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.zero {
  width: 80px;
  background: #2a6a3a;
  text-align: center;
  font-weight: bold;
  font-size: 1.3rem;
}

.numbers-grid {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.number-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bet-cell {
  background: #1a5a2a;
  color: white;
  text-align: center;
  padding: 10px 8px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid rgba(255, 215, 0, 0.3);
  user-select: none;
}

.bet-cell:hover {
  transform: scale(1.02);
  background: #2a7a3a;
  border-color: #ffd700;
}

.bet-cell.active {
  background: #ffd700;
  color: #1a1a1a;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  border-color: #ffd700;
}

.number-cell.red {
  background: #dc3545;
}

.number-cell.black {
  background: #1a1a1a;
}

.number-cell:hover {
  filter: brightness(1.1);
}

.special-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.special {
  background: #1a5a2a;
  font-size: 0.9rem;
  padding: 10px 5px;
}

.special.red {
  background: #dc3545;
}

.special.black {
  background: #1a1a1a;
}

.dozen-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.dozen {
  background: #1a5a2a;
  font-size: 1rem;
  padding: 10px;
}

</style>