<script setup lang="ts">
import type { ProductSummary, ProductsResponse } from '~/types/dummyjson'

const route = useRoute()

// L'URL est la source de vérité : la page affichée vient de `?page=`.
const page = computed(() => parsePage(route.query.page))
const query = computed(() => buildCatalogQuery(page.value))

// useFetch s'exécute côté serveur au premier affichage (SSR),
// puis côté client quand `query` change (clic sur « Suivant »).
// `status` indique où en est la requête ; `refresh` la relance.
const { data, status, refresh } = await useFetch<
  ProductsResponse<ProductSummary>
>('/products', {
  baseURL: API_BASE,
  query,
})

const products = computed(() => data.value?.products ?? [])
const totalPages = computed(() => countPages(data.value?.total ?? 0))
const viewState = computed(() =>
  getCatalogViewState(status.value, products.value.length),
)

// Autant de cartes grises que de produits attendus.
const skeletonCount = PAGE_SIZE

// Lien vers la première page, en gardant les autres paramètres de l'URL.
const firstPageLink = computed(() => ({
  query: { ...route.query, page: undefined },
}))

useSeoMeta({
  title: () => `Catalogue – page ${page.value} | ChampaShop`,
  description:
    'Découvrez le catalogue ChampaShop : beauté, maison, épicerie et plus encore.',
})
</script>

<template>
  <section>
    <h1>Catalogue</h1>

    <!-- Chargement : des cartes grises à la place des produits -->
    <div v-if="viewState === 'loading'" aria-busy="true">
      <p role="status" class="visually-hidden">Chargement des produits…</p>
      <ul class="product-grid">
        <li v-for="n in skeletonCount" :key="n">
          <ProductCardSkeleton />
        </li>
      </ul>
    </div>

    <!-- Erreur réseau -->
    <ErrorMessage
      v-else-if="viewState === 'error'"
      message="Impossible de charger les produits. Vérifiez votre connexion."
      @retry="refresh()"
    />

    <!-- Aucun résultat (ex. : ?page=99) -->
    <div v-else-if="viewState === 'empty'" class="empty" role="status">
      <p>Aucun produit trouvé.</p>
      <NuxtLink :to="firstPageLink">Revenir au début du catalogue</NuxtLink>
    </div>

    <!-- Produits -->
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

.empty {
  padding: 2rem;
  text-align: center;
}
</style>
