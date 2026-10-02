<script setup lang="ts">
defineProps<{
  message: string
}>()

// Le parent décide quoi faire quand on clique sur « Réessayer ».
const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-message" role="alert">
    <p>{{ message }}</p>
    <button type="button" class="error-message__button" @click="emit('retry')">
      Réessayer
    </button>
  </div>
</template>

<style scoped>
.error-message {
  padding: 1.5rem;
  border: 1px solid #b3261e;
  border-radius: 0.5rem;
  background: #fdecea;
  text-align: center;
}

.error-message__button {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.25rem;
  background: #b3261e;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.error-message__button:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}
</style>
