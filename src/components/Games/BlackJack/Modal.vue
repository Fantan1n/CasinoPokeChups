<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-close" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <slot>Текст модального окна</slot>
      </div>
      <div class="modal-footer">
        <button v-if="type === 'confirm'" @click="confirm" class="modal-btn confirm">Да</button>
        <button v-if="type === 'confirm'" @click="close" class="modal-btn cancel">Нет</button>
        <button v-if="type === 'alert'" @click="close" class="modal-btn confirm">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Внимание'
  },
  type: {
    type: String,
    default: 'confirm'  // 'confirm' или 'alert'
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const isVisible = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal
})

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  background: white;
  border-radius: 15px;
  width: 350px;
  max-width: 90%;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}
.modal-header {
  background: #1a4d2a;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
.modal-body {
  padding: 20px;
  text-align: center;
  color: #333;
  font-size: 16px;
}
.modal-footer {
  padding: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}
.modal-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.confirm {
  background: #4caf50;
  color: white;
}
.cancel {
  background: #9e9e9e;
  color: white;
}
</style>