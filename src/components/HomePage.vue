<template>
  <div class="home">
    <div class="hero">
      <h1>PokeChups.money</h1>
      <p>Выберите игру и испытайте удачу</p>
    </div>
    
    <div class="games-grid">
      <div class="game-card sausage-card" @click="goToSausage">
        <div class="game-overlay"></div>
        <div class="game-content">
          <div class="game-icon"></div>
          <h2>Sausage Game</h2>
          <p>Прыгай по тарелкам, удваивай выигрыш и не наступи на опасную</p>
          <button class="play-btn">Играть</button>
        </div>
      </div>
      
      <div class="game-card roulette-card" @click="goToRoulette">
        <div class="game-overlay"></div>
        <div class="game-content">
          <div class="game-icon"></div>
          <h2>Рулетка</h2>
          <p>Классическая европейская рулетка. Ставьте на числа, цвета, сектора</p>
          <button class="play-btn">Играть</button>
        </div>
      </div>
      
      <div class="game-card blackjack-card" @click="goToBlackJack">
        <div class="game-overlay"></div>
        <div class="game-content">
          <div class="game-icon"></div>
          <h2>BlackJack</h2>
          <p>21 очко против дилера. Испытай удачу!</p>
          <button class="play-btn">Играть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToSausage = () => {
  router.push('/sausage')
}

const goToRoulette = () => {
  router.push('/roulette')
}

const goToBlackJack = () => {
  router.push('/blackjack')
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 150px);
  padding: 40px 20px;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
}

.hero h1 {
  font-size: 3rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  margin-bottom: 15px;
}

.hero p {
  font-size: 1.2rem;
  color: #ccc;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.game-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 400px;
  background-size: cover;
  background-position: center;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.sausage-card {
  background-image: url('../img/sausage-bg.png');
}

.roulette-card {
  background-image: url('../img/roulette-bg.png');
}

.blackjack-card {
  background-image: url('../img/blackjack-bg.png');
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  transition: background 0.3s;
}

.game-card:hover .game-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.game-content {
  position: relative;
  z-index: 2;
  padding: 40px 30px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.game-card h2 {
  color: #ffd700;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.game-card p {
  color: #ddd;
  margin-bottom: 25px;
  line-height: 1.4;
}

.play-btn {
  background: #ffd700;
  color: #1a1a1a;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  width: fit-content;
  margin: 0 auto;
}

.play-btn:hover {
  background: #e6c200;
  transform: scale(1.05);
}
</style>