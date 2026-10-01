<script setup lang="ts">
import type { ProductCategory } from '~/types/dummyjson'
import type {
  CatalogFiltersValue,
  CatalogSort,
  SortField,
  SortOrder,
} from '~/utils/catalog'

const props = defineProps<{
  categories: ProductCategory[]
  /** Valeurs actuellement dans l'URL. */
  category: string
  sort: CatalogSort | null
  /** Recherche en cours, conservée quand le formulaire est envoyé sans JS. */
  search: string
}>()

const emit = defineEmits<{
  change: [value: CatalogFiltersValue]
}>()

// Copies locales des valeurs, liées aux <select> avec v-model.
const category = ref(props.category)
const sortBy = ref<SortField | ''>(props.sort?.sortBy ?? '')
const order = ref<SortOrder>(props.sort?.order ?? 'asc')

// Si l'URL change autrement (bouton retour, lien partagé), on se resynchronise.
watch(
  () => [props.category, props.sort] as const,
  ([newCategory, newSort]) => {
    category.value = newCategory
    sortBy.value = newSort?.sortBy ?? ''
    order.value = newSort?.order ?? 'asc'
  },
)

function onChange(): void {
  emit('change', {
    category: category.value,
    sort: sortBy.value ? { sortBy: sortBy.value, order: order.value } : null,
  })
}
</script>

<template>
  <!--
    Sans JavaScript : le bouton « Appliquer » envoie le formulaire en GET
    vers /produits?category=…&sortBy=…&order=…, rendu par le serveur.
    Avec JavaScript : chaque changement met à jour l'URL immédiatement.
  -->
  <form action="/produits" method="get" class="filters" @submit.prevent>
    <input v-if="search" type="hidden" name="q" :value="search" />

    <div class="filters__field">
      <label for="filter-category">Catégorie</label>
      <select
        id="filter-category"
        v-model="category"
        name="category"
        @change="onChange"
      >
        <option value="">Toutes les catégories</option>
        <option v-for="item in categories" :key="item.slug" :value="item.slug">
          {{ item.name }}
        </option>
      </select>
    </div>

    <div class="filters__field">
      <label for="filter-sort">Trier par</label>
      <select
        id="filter-sort"
        v-model="sortBy"
        name="sortBy"
        @change="onChange"
      >
        <option value="">Pertinence</option>
        <option value="price">Prix</option>
        <option value="rating">Note</option>
        <option value="title">Titre</option>
      </select>
    </div>

    <div class="filters__field">
      <label for="filter-order">Ordre</label>
      <select
        id="filter-order"
        v-model="order"
        name="order"
        :disabled="!sortBy"
        @change="onChange"
      >
        <option value="asc">Croissant</option>
        <option value="desc">Décroissant</option>
      </select>
    </div>

    <noscript>
      <button type="submit" class="filters__submit">Appliquer</button>
    </noscript>
  </form>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin: 0 0 1.5rem;
}

.filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filters__field label {
  font-weight: 600;
}

.filters__field select {
  min-width: 12rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #767676;
  border-radius: 0.375rem;
  background: #fff;
  font: inherit;
}

.filters__field select:focus-visible,
.filters__submit:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}

.filters__submit {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background: #1a4fd8;
  color: #fff;
  font: inherit;
}
</style>
