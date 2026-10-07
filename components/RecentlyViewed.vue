<script setup lang="ts">
import { PRODUCT_SUMMARY_FIELDS, type ProductSummary } from '~/types/dummyjson'

const props = defineProps<{
  /** Produit à ne pas afficher (la fiche en cours). */
  excludeId?: number
}>()

const store = useRecentlyViewedStore()

const idsToShow = computed(() =>
  store.ids.filter((id) => id !== props.excludeId),
)

// DummyJSON ne sait pas renvoyer plusieurs produits par identifiants :
// un appel par produit, tous en parallèle, avec `select` pour ne
// télécharger que ce que la carte affiche. Un produit qui n'existe plus
// est simplement retiré de l'affichage, sans bloquer les autres.
const { data: products } = await useAsyncData(
  `recently-viewed-${props.excludeId ?? 'all'}`,
  async (): Promise<ProductSummary[]> => {
    const results = await Promise.all(
      idsToShow.value.map((id) =>
        $fetch<ProductSummary>(`/products/${id}`, {
          baseURL: API_BASE,
          query: { select: PRODUCT_SUMMARY_FIELDS.join(',') },
        }).catch(() => null),
      ),
    )
    return results.filter(
      (product): product is ProductSummary => product !== null,
    )
  },
  { watch: [idsToShow], default: () => [] },
)
</script>

<template>
  <section v-if="products.length" class="recent" aria-labelledby="recent-title">
    <div class="recent__header">
      <h2 id="recent-title" class="recent__title">Vus récemment</h2>
      <button type="button" class="recent__clear" @click="store.clear()">
        Effacer l'historique
      </button>
    </div>

    <ul class="recent__list">
      <li v-for="product in products" :key="product.id">
        <NuxtLink :to="`/produits/${product.id}`" class="recent__item">
          <img
            :src="product.thumbnail"
            alt=""
            width="120"
            height="120"
            loading="lazy"
          />
          <span class="recent__name">{{ product.title }}</span>
          <span class="recent__price">{{ formatPrice(product.price) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.recent {
  margin-top: 3rem;
}

.recent__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.recent__title {
  margin: 0;
}

.recent__clear {
  padding: 0.5rem 1rem;
  border: 1px solid #767676;
  border-radius: 0.375rem;
  background: #fff;
  font: inherit;
  cursor: pointer;
}

.recent__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.recent__item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 0.5rem;
  background: #fff;
  color: inherit;
  text-decoration: none;
}

.recent__item img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
}

.recent__name {
  font-size: 0.875rem;
}

.recent__price {
  font-weight: 700;
}

.recent__clear:focus-visible,
.recent__item:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}
</style>
