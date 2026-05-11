<template>
  <div id="app">
    <RouletteGame />
  </div>
</template>

<script setup>
import RouletteGame from './components/Roulette/RouletteGame.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #0a0a1a;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>