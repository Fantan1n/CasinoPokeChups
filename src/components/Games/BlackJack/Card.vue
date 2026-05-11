<template>
  <div class="card" :class="{ 'card-hidden': hidden }">
    <div v-if="!hidden" class="card-face">
      <div class="corner top-left">
        <div class="rank">{{ card.value }}</div>
        <div class="suit" :style="{ color: suitColor }">{{ card.suit }}</div>
      </div>
      <div class="center-suit" :style="{ color: suitColor }">{{ card.suit }}</div>
      <div class="corner bottom-right">
        <div class="rank">{{ card.value }}</div>
        <div class="suit" :style="{ color: suitColor }">{{ card.suit }}</div>
      </div>
    </div>
    <div v-else class="card-back">
      🃟
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  hidden: { type: Boolean, default: false }
})

const suitColor = computed(() => {
  return (props.card.suit === '♥' || props.card.suit === '♦') ? '#e53935' : '#1a1a1a'
})
</script>

<style scoped>
.card {
  width: 90px;
  height: 130px;
  background: white;
  border-radius: 10px;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  position: relative;
  margin: 5px;
  color: #1a1a1a;  /* ← ДОБАВИТЬ: базовый цвет текста */
}
.card-face {
  width: 100%;
  height: 100%;
  position: relative;
}
.corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}
.top-left {
  top: 5px;
  left: 5px;
}
.bottom-right {
  bottom: 5px;
  right: 5px;
  transform: rotate(180deg);
}
.rank {
  font-size: 18px;
  font-weight: bold;
  color: inherit;  /* ← ДОБАВИТЬ */
}
.suit {
  font-size: 16px;
}
.center-suit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
}
.card-back {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2c5f2d, #1a3b1a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  border-radius: 10px;
}
.card-hidden {
  background: #1a3b1a;
}
</style>