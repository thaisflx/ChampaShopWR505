<script setup lang="ts">
import type { ProductSummary, ProductsResponse } from '~/types/dummyjson'

const route = useRoute()
const router = useRouter()

// L'URL est la source de vérité : page (`?page=`) et recherche (`?q=`).
const page = computed(() => parsePage(route.query.page))
const search = computed(() => parseSearch(route.query.q))
const request = computed(() =>
  buildCatalogRequest({ page: page.value, search: search.value }),
)

// useFetch s'exécute côté serveur au premier affichage (SSR),
// puis côté client à chaque changement de l'URL (chemin ou paramètres).
// `status` indique où en est la requête ; `refresh` la relance.
const { data, status, refresh } = await useFetch<
  ProductsResponse<ProductSummary>
>(() => request.value.path, {
  baseURL: API_BASE,
  query: computed(() => request.value.query),
  // Frappe rapide : si une requête est encore en cours quand une nouvelle part,
  // seule la réponse de la plus récente est gardée. Une réponse plus ancienne
  // est ignorée : elle ne peut jamais écraser les résultats affichés.
  dedupe: 'cancel',
})

const products = computed(() => data.value?.products ?? [])
const totalPages = computed(() => countPages(data.value?.total ?? 0))
const viewState = computed(() =>
  getCatalogViewState(status.value, products.value.length),
)

// Autant de cartes grises que de produits attendus.
const skeletonCount = PAGE_SIZE

// Nouvelle recherche : on l'écrit dans l'URL et on revient en page 1.
// `replace` plutôt que `push` : on ne crée pas une entrée d'historique
// par mot tapé, sinon le bouton retour remonterait lettre par lettre.
function onSearch(value: string): void {
  router.replace({
    query: { ...route.query, q: value || undefined, page: undefined },
  })
}

// Lien « tout le catalogue » : sans recherche, en page 1.
const resetLink = computed(() => ({
  query: { ...route.query, q: undefined, page: undefined },
}))

useSeoMeta({
  title: () =>
    search.value
      ? `Recherche « ${search.value} » – page ${page.value} | ChampaShop`
      : `Catalogue – page ${page.value} | ChampaShop`,
  description:
    'Découvrez le catalogue ChampaShop : beauté, maison, épicerie et plus encore.',
})
</script>

<template>
  <section>
    <h1>Catalogue</h1>

    <CatalogSearch :value="search" @search="onSearch" />

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

    <!-- Aucun résultat (recherche sans résultat, ?page=99…) -->
    <div v-else-if="viewState === 'empty'" class="empty" role="status">
      <p v-if="search">Aucun produit ne correspond à « {{ search }} ».</p>
      <p v-else>Aucun produit trouvé.</p>
      <NuxtLink :to="resetLink">Voir tout le catalogue</NuxtLink>
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
