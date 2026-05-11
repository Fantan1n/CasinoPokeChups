<template>
  <div>
    <nav>
      <RouterLink :to="{ name: 'Blackjack' }">Blackjack</RouterLink>
      <RouterLink :to="{ name: 'Roulette' }" v-if="false">Рулетка</RouterLink>
      <RouterLink :to="{ name: 'FrogJump' }" v-if="false">Frog Jump</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  background: #0d2b1a;
  font-family: Arial, sans-serif;
}
nav {
  background: #0a1f12;
  padding: 15px;
  text-align: center;
  border-bottom: 2px solid gold;
}
nav a {
  color: gold;
  margin: 0 20px;
  text-decoration: none;
  font-size: 22px;
  font-weight: bold;
}
nav a:hover {
  color: white;
}
</style>