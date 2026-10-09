<script setup lang="ts">
const props = defineProps<{
  productId: number
  title: string
}>()

const COMPARE_FULL_MESSAGE =
  'Comparateur plein : retirez un produit pour en ajouter un autre'

const compare = useCompareStore()
const selected = computed(() => compare.has(props.productId))
const message = ref('')

async function handleClick(): Promise<void> {
  const result = compare.toggle(props.productId)
  // On vide d'abord la zone : si le message est identique au précédent
  // (2e clic sur un 4e produit), il est quand même annoncé de nouveau.
  message.value = ''
  if (!result.rejected) return
  await nextTick()
  message.value = COMPARE_FULL_MESSAGE
}

watch(
  () => compare.count,
  () => {
    message.value = ''
  },
)
</script>

<template>
  <div class="compare">
    <button
      type="button"
      class="compare__button"
      :class="{ 'compare__button--selected': selected }"
      :aria-pressed="selected"
      @click="handleClick"
    >
      <span v-if="selected" aria-hidden="true">✓ </span>Comparer<span
        class="visually-hidden"
      >
        {{ title }}</span
      >
    </button>
    <p role="status" class="compare__message">{{ message }}</p>
  </div>
</template>

<style scoped>
.compare__button {
  padding: 0.5rem 1rem;
  border: 1px solid #1a4fd8;
  border-radius: 0.375rem;
  background: #fff;
  color: #1a4fd8;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.compare__button--selected {
  background: #1a4fd8;
  color: #fff;
}

.compare__button:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 3px;
}

.compare__message {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #8a4b00;
}

/* Pas de display: none : une zone aria-live masquée au moment où son
   contenu change n'est pas toujours annoncée par les lecteurs d'écran. */
.compare__message:empty {
  margin: 0;
}
</style>
