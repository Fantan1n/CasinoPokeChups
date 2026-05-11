import { ref, watch } from 'vue'

const allNumbers = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 36
]

const getColor = (num) => {
  if (num === 0) return 'green'
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  return redNumbers.includes(num) ? 'red' : 'black'
}

export default function useRoulette() {
  const balance = ref(1000)
  const lastResult = ref(null)
  const history = ref([])
  const isSpinning = ref(false)

  watch(balance, (newVal) => {
    localStorage.setItem('casino_balance', JSON.stringify(newVal))
  })

  watch(history, (newVal) => {
    localStorage.setItem('rouletteHistory', JSON.stringify(newVal.slice(0, 50)))
  }, { deep: true })

  const loadBalance = () => {
    const saved = localStorage.getItem('casino_balance')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed === 'number') balance.value = parsed
      } catch (e) {}
    }
  }

  const addBalance = (amount) => {
    const num = Number(amount)
    if (num > 0) balance.value += num
  }

  const calculateWin = (betType, betValue, winNumber, amount) => {
    const winColor = getColor(winNumber)
    
    if (betType === 'number') {
      if (winNumber === betValue) return { isWin: true, winAmount: amount * 35 }
    }
    else if (betType === 'color') {
      if (winColor === betValue && winNumber !== 0) return { isWin: true, winAmount: amount }
    }
    else if (betType === 'evenOdd') {
      if (winNumber !== 0) {
        const isEven = winNumber % 2 === 0
        if ((betValue === 'even' && isEven) || (betValue === 'odd' && !isEven)) {
          return { isWin: true, winAmount: amount }
        }
      }
    }
    else if (betType === 'half') {
      if (winNumber !== 0) {
        const isFirstHalf = winNumber <= 18
        if ((betValue === '1-18' && isFirstHalf) || (betValue === '19-36' && !isFirstHalf)) {
          return { isWin: true, winAmount: amount }
        }
      }
    }
    else if (betType === 'dozen') {
      if (winNumber !== 0) {
        let dozen = winNumber <= 12 ? 1 : (winNumber <= 24 ? 2 : 3)
        if (dozen === betValue) return { isWin: true, winAmount: amount * 2 }
      }
    }
    
    return { isWin: false, winAmount: 0 }
  }

  const finalizeSpin = (winNumber, betType, betValue, amount) => {
    const winColor = getColor(winNumber)
    const { isWin, winAmount } = calculateWin(betType, betValue, winNumber, amount)
    
    let totalWin = 0
    if (isWin) {
      totalWin = amount + winAmount
      balance.value += totalWin
    }
    
    const gameResult = {
      winNumber,
      winColor,
      betType,
      betValue,
      amount,
      isWin,
      winAmount: totalWin,
      date: Date.now()
    }
    
    lastResult.value = gameResult
    history.value.unshift(gameResult)
    
    return gameResult
  }

  loadBalance()
  
  return {
    balance,
    lastResult,
    history,
    isSpinning,
    allNumbers,
    finalizeSpin,
    addBalance,
    getColor
  }
}