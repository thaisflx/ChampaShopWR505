<script setup lang="ts">
import type { ProductSummary, ProductsResponse } from '~/types/dummyjson'

const route = useRoute()

// L'URL est la source de vérité : la page affichée vient de `?page=`.
const page = computed(() => parsePage(route.query.page))
const query = computed(() => buildCatalogQuery(page.value))

// useFetch s'exécute côté serveur au premier affichage (SSR),
// puis côté client quand `query` change (clic sur « Suivant »).
const { data, error } = await useFetch<ProductsResponse<ProductSummary>>(
  '/products',
  {
    baseURL: API_BASE,
    query,
  },
)

const products = computed(() => data.value?.products ?? [])
const totalPages = computed(() => countPages(data.value?.total ?? 0))

useSeoMeta({
  title: () => `Catalogue – page ${page.value} | ChampaShop`,
  description:
    'Découvrez le catalogue ChampaShop : beauté, maison, épicerie et plus encore.',
})
</script>

<template>
  <section>
    <h1>Catalogue</h1>

    <p v-if="error" role="alert">
      Impossible de charger les produits pour le moment.
    </p>

    <template v-else>
      <ul class="product-grid">
        <li v-for="product in products" :key="product.id">
          <ProductCard :product="product" />
        </li>
      </ul>

      <AppPagination :current-page="page" :total-pages="totalPages" />
    </template>
  </section>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 0;
  list-style: none;
}
</style>
