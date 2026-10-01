<script setup lang="ts">
const props = defineProps<{
  /** Recherche actuellement dans l'URL. */
  value: string
}>()

const emit = defineEmits<{
  search: [value: string]
}>()

const text = ref(props.value)

// Si l'URL change sans passer par le champ (bouton retour, lien partagé),
// on met le champ à jour.
watch(
  () => props.value,
  (newValue) => {
    if (newValue !== text.value.trim()) text.value = newValue
  },
)

// On attend 300 ms sans frappe avant de lancer la recherche.
const debouncedSearch = debounce(
  (value: string) => emit('search', value.trim()),
  SEARCH_DEBOUNCE_MS,
)

function onInput(): void {
  debouncedSearch(text.value)
}

// Entrée : on n'attend pas les 300 ms.
function onSubmit(): void {
  debouncedSearch.cancel()
  emit('search', text.value.trim())
}

// Si on quitte la page pendant l'attente, on annule la recherche prévue.
onBeforeUnmount(() => debouncedSearch.cancel())
</script>

<template>
  <!--
    Sans JavaScript, le formulaire est envoyé normalement : GET /produits?q=…
    et la page est rendue par le serveur. Avec JavaScript, on intercepte l'envoi.
  -->
  <form
    role="search"
    action="/produits"
    method="get"
    class="search"
    @submit.prevent="onSubmit"
  >
    <label for="catalog-search" class="search__label">
      Rechercher un produit
    </label>
    <input
      id="catalog-search"
      v-model="text"
      type="search"
      name="q"
      class="search__input"
      autocomplete="off"
      @input="onInput"
    />
  </form>
</template>

<style scoped>
.search {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-width: 28rem;
  margin: 0 0 1.5rem;
}

.search__label {
  font-weight: 600;
}

.search__input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #767676;
  border-radius: 0.375rem;
  font: inherit;
}

.search__input:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}
</style>
