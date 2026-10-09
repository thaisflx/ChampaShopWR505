<script setup lang="ts">
const props = defineProps<{
  url: string
}>()

const message = ref('')
const showFallback = ref(false)
const fallbackInput = useTemplateRef<HTMLInputElement>('fallbackInput')

// Une zone aria-live n'est annoncée que si son texte change : on la vide
// d'abord, pour qu'un 2ᵉ clic soit annoncé lui aussi.
async function announce(text: string): Promise<void> {
  message.value = ''
  await nextTick()
  message.value = text
}

function canUseClipboard(): boolean {
  // L'API n'existe que dans un contexte sécurisé (HTTPS ou localhost)
  // et pas dans tous les navigateurs.
  return (
    typeof navigator !== 'undefined' &&
    navigator.clipboard !== undefined &&
    typeof navigator.clipboard.writeText === 'function'
  )
}

async function switchToFallback(): Promise<void> {
  showFallback.value = true
  await announce(
    'Copie automatique impossible : le lien est sélectionné ci-dessous, copiez-le avec Cmd + C ou Ctrl + C.',
  )
  await nextTick()
  fallbackInput.value?.focus()
  fallbackInput.value?.select()
}

async function copy(): Promise<void> {
  if (!canUseClipboard()) {
    await switchToFallback()
    return
  }
  try {
    await navigator.clipboard.writeText(props.url)
    showFallback.value = false
    await announce('Lien copié dans le presse-papiers.')
  } catch {
    // Permission refusée, page sans focus… : on passe au repli.
    await switchToFallback()
  }
}
</script>

<template>
  <div class="copy-link">
    <button type="button" class="copy-link__button" @click="copy">
      Copier le lien
    </button>

    <!-- Solution de repli : le lien dans un champ, prêt à être copié. -->
    <div v-if="showFallback" class="copy-link__fallback">
      <label for="copy-link-input">Lien de la comparaison</label>
      <input
        id="copy-link-input"
        ref="fallbackInput"
        type="text"
        readonly
        :value="url"
      />
    </div>

    <!-- Toujours présent dans le DOM pour être annoncé quand il change. -->
    <p class="copy-link__message" aria-live="polite">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.copy-link {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.copy-link__button {
  padding: 0.5rem 1rem;
  border: 1px solid #1a4fd8;
  border-radius: 0.375rem;
  background: #fff;
  color: #1a4fd8;
  font: inherit;
  cursor: pointer;
}

.copy-link__button:focus-visible,
.copy-link__fallback input:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}

.copy-link__fallback {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 18rem;
}

.copy-link__fallback input {
  padding: 0.375rem 0.5rem;
  border: 1px solid #767676;
  border-radius: 0.25rem;
  font: inherit;
}

.copy-link__message {
  margin: 0;
  color: #1b6b2f;
  font-weight: 600;
}
</style>
