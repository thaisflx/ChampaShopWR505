<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const route = useRoute()

// On garde les autres paramètres de l'URL (recherche, tri… plus tard)
// et on ne change que `page`.
function pageLink(page: number) {
  return { query: { ...route.query, page: String(page) } }
}

const hasPrevious = computed(() => props.currentPage > 1)
const hasNext = computed(() => props.currentPage < props.totalPages)
</script>

<template>
  <nav class="pagination" aria-label="Pagination du catalogue">
    <NuxtLink
      v-if="hasPrevious"
      :to="pageLink(currentPage - 1)"
      class="pagination__link"
    >
      ← Précédent
    </NuxtLink>
    <span v-else class="pagination__link" aria-disabled="true">
      ← Précédent
    </span>

    <p class="pagination__status" aria-live="polite">
      Page {{ currentPage }} sur {{ totalPages }}
    </p>

    <NuxtLink
      v-if="hasNext"
      :to="pageLink(currentPage + 1)"
      class="pagination__link"
    >
      Suivant →
    </NuxtLink>
    <span v-else class="pagination__link" aria-disabled="true">
      Suivant →
    </span>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.pagination__link {
  padding: 0.5rem 1rem;
  border: 1px solid #1a4fd8;
  border-radius: 0.25rem;
  color: #1a4fd8;
  text-decoration: none;
}

.pagination__link:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}

.pagination__link[aria-disabled='true'] {
  border-color: #767676;
  color: #595959;
  cursor: not-allowed;
}

.pagination__status {
  margin: 0;
}
</style>
