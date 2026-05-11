<template>
  <div class="roulette-slot">
    <div class="slot-machine">
      <div class="slot-window">
        <div class="numbers-track" :style="{ transform: `translateX(${offset}px)` }">
          <div 
            v-for="(num, idx) in displayNumbers" 
            :key="idx"
            class="number-item"
            :class="getNumberColor(num)"
          >
            {{ num }}
          </div>
        </div>
      </div>
      <div class="pointer">▼</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  isSpinning: {
    type: Boolean,
    default: false
  },
  allNumbers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['stop'])

const getNumberColor = (num) => {
  if (num === 0) return 'green'
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  return redNumbers.includes(num) ? 'red' : 'black'
}

const ITEM_WIDTH = 70
const VISIBLE_ITEMS = 10
const WINDOW_WIDTH = 700

const displayNumbers = ref([])
const offset = ref(0)

let animationInterval = null
let currentSpeed = 0
let isStopping = false
let stopTimeout = null

// Генерация ленты чисел (3 цикла для бесконечности)
const generateNumberSequence = () => {
  const sequence = []
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 0; i < props.allNumbers.length; i++) {
      sequence.push(props.allNumbers[i])
    }
  }
  return sequence
}

// Определить число под стрелкой (центр окна)
const getNumberUnderPointer = () => {
  const targetVisiblePosition = 5 // 5-й элемент (0-index)
  const currentStartIndex = Math.floor(Math.abs(offset.value) / ITEM_WIDTH)
  const targetIndex = currentStartIndex + targetVisiblePosition
  
  if (targetIndex >= 0 && targetIndex < displayNumbers.value.length) {
    return displayNumbers.value[targetIndex]
  }
  return 0
}

const startSpin = () => {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
  
  if (stopTimeout) {
    clearTimeout(stopTimeout)
    stopTimeout = null
  }
  
  displayNumbers.value = generateNumberSequence()
  offset.value = 0
  currentSpeed = 12 + Math.random() * 8
  isStopping = false
  
  animationInterval = setInterval(() => {
    if (!isStopping) {
      offset.value -= currentSpeed
      
      const maxOffset = -(displayNumbers.value.length * ITEM_WIDTH - WINDOW_WIDTH)
      if (offset.value < maxOffset) {
        offset.value = 0
      }
    }
  }, 16)
  
  const stopDelay = 2000 + Math.random() * 1000
  stopTimeout = setTimeout(() => {
    if (!isStopping) {
      stopSpin()
    }
  }, stopDelay)
}

// Плавная остановка
const stopSpin = () => {
  if (isStopping) return
  
  isStopping = true
  
  if (stopTimeout) {
    clearTimeout(stopTimeout)
    stopTimeout = null
  }
  
  // Плавно уменьшаем скорость
  let deceleration = 0.97
  let minSpeed = 0.5
  
  const decelerate = () => {
    if (Math.abs(currentSpeed) > minSpeed) {
      currentSpeed *= deceleration
      offset.value -= currentSpeed
      requestAnimationFrame(decelerate)
    } else {
      // Полная остановка
      if (animationInterval) {
        clearInterval(animationInterval)
        animationInterval = null
      }
      currentSpeed = 0
      
      const finalNumber = getNumberUnderPointer()
      
      emit('stop', finalNumber)
      isStopping = false
    }
  }
  
  requestAnimationFrame(decelerate)
}

const resetSpin = () => {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
  if (stopTimeout) {
    clearTimeout(stopTimeout)
    stopTimeout = null
  }
  isStopping = false
  currentSpeed = 0
  displayNumbers.value = generateNumberSequence()
  offset.value = 0
}

watch(() => props.isSpinning, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    resetSpin()
    startSpin()
  } else if (!newVal && oldVal) {
    // Если parent выключил isSpinning, останавливаем
    if (!isStopping && animationInterval) {
      stopSpin()
    }
  }
})

displayNumbers.value = generateNumberSequence()
offset.value = 0

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
  if (stopTimeout) {
    clearTimeout(stopTimeout)
  }
})
</script>

<style scoped>
.roulette-slot {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.slot-machine {
  position: relative;
  background: #1a1a1a;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.slot-window {
  width: 700px;
  height: 100px;
  overflow: hidden;
  background: #0a0a0a;
  border-radius: 15px;
  border: 3px solid #ffd700;
  position: relative;
}

.numbers-track {
  display: flex;
  height: 100%;
  white-space: nowrap;
  will-change: transform;
}

.number-item {
  width: 70px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.number-item.red { background: #dc3545; color: white; }
.number-item.black { background: #1a1a1a; color: white; }
.number-item.green { background: #28a745; color: white; }

.pointer {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 10;
}
</style>