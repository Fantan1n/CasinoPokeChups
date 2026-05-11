import { ref, computed, watch } from 'vue'

// Функция создания перемешанной колоды
function createDeck() {
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
  
  // Перемешивание
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

// Подсчёт очков
function calculateScore(cards) {
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

export function useBlackjack() {
  // ========== ДАННЫЕ ==========
  const deck = ref([])
  const playerCards = ref([])
  const dealerCards = ref([])
  const gameStatus = ref('bet')  // bet, playing, playerBust, dealerBust, playerWin, dealerWin, push
  const balance = ref(1000)
  const currentBet = ref(50)
  
  // ========== ВЫЧИСЛЯЕМЫЕ ==========
  const playerScore = computed(() => calculateScore(playerCards.value))
  const dealerScore = computed(() => calculateScore(dealerCards.value))
  const gameStarted = computed(() => gameStatus.value !== 'bet')
  
  // ========== ВСПОМОГАТЕЛЬНЫЕ ==========
  function drawCard() {
    if (deck.value.length === 0) {
      deck.value = createDeck()
    }
    return deck.value.pop()
  }
  
  function startNewGame() {
    deck.value = createDeck()
    playerCards.value = []
    dealerCards.value = []
    gameStatus.value = 'bet'
  }
  
  // ========== ОСНОВНЫЕ ФУНКЦИИ ==========
  
  function placeBet(amount) {
    // Проверки
    if (amount > balance.value) return false
    if (amount < 10) return false
    if (balance.value <= 0) return false
    
    // Списываем ставку
    currentBet.value = amount
    balance.value -= amount
    
    // Раздаём карты
    playerCards.value = []
    dealerCards.value = []
    playerCards.value.push(drawCard())
    playerCards.value.push(drawCard())
    dealerCards.value.push(drawCard())
    dealerCards.value.push(drawCard())
    
    // Меняем статус игры
    gameStatus.value = 'playing'
    
    // Важно: если у игрока сразу 21 (Blackjack) - автоматический выигрыш
    if (playerScore.value === 21) {
      // Автоматический выигрыш
      gameStatus.value = 'playerWin'
      balance.value += currentBet.value * 2
    }
    
    return true
  }
  
  function hit() {
    if (gameStatus.value !== 'playing') return
    
    playerCards.value.push(drawCard())
    
    if (playerScore.value > 21) {
      gameStatus.value = 'playerBust'
      // Баланс уже списан при ставке, ничего не возвращаем
    }
  }
  
  function stand() {
    if (gameStatus.value !== 'playing') return
    
    // Ход дилера
    while (dealerScore.value < 17) {
      dealerCards.value.push(drawCard())
    }
    
    // Определение победителя
    if (dealerScore.value > 21) {
      gameStatus.value = 'dealerBust'
      balance.value += currentBet.value * 2  // Выигрыш
    } else if (playerScore.value > dealerScore.value) {
      gameStatus.value = 'playerWin'
      balance.value += currentBet.value * 2
    } else if (playerScore.value < dealerScore.value) {
      gameStatus.value = 'dealerWin'
      // Проигрыш — баланс уже списан
    } else {
      gameStatus.value = 'push'
      balance.value += currentBet.value  // Возврат ставки
    }
  }
  
  function playAgain() {
    // Проверяем, есть ли деньги
    if (balance.value < 10) {
      gameStatus.value = 'bet'
      return false
    }
    
    // Перезапускаем игру (очищаем карты, но баланс не трогаем)
    deck.value = createDeck()
    playerCards.value = []
    dealerCards.value = []
    gameStatus.value = 'bet'
    return true
  }
  
  function resetBalance() {
    balance.value = 1000
    currentBet.value = 50
    startNewGame()
  }
  
  // ========== LOCALSTORAGE ==========
  const savedBalance = localStorage.getItem('blackjack_balance')
  if (savedBalance !== null) {
    const parsed = Number(savedBalance)
    if (!isNaN(parsed) && parsed > 0) {
      balance.value = parsed
    }
  }
  
  watch(balance, (newBalance) => {
    localStorage.setItem('blackjack_balance', newBalance)
  }, { deep: false })
  
  return {
    balance,
    currentBet,
    playerCards,
    dealerCards,
    playerScore,
    dealerScore,
    gameStatus,
    gameStarted,
    placeBet,
    hit,
    stand,
    playAgain,
    startNewGame,
    resetBalance
  }
}