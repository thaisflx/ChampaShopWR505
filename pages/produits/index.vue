<script setup lang="ts">
import type {
  ProductCategory,
  ProductSummary,
  ProductsResponse,
} from '~/types/dummyjson'
import type { CatalogFiltersValue } from '~/utils/catalog'

const route = useRoute()
const router = useRouter()

// L'URL est la source de vérité : page, recherche, catégorie et tri.
const filters = computed(() => ({
  page: parsePage(route.query.page),
  search: parseSearch(route.query.q),
  category: parseCategory(route.query.category),
  sort: parseSort(route.query.sortBy, route.query.order),
}))
const request = computed(() => buildCatalogRequest(filters.value))

// Liste des catégories pour le menu déroulant (rendue côté serveur elle aussi).
const { data: categories } = await useFetch<ProductCategory[]>(
  '/products/categories',
  { baseURL: API_BASE, key: 'categories', default: () => [] },
)

// useFetch s'exécute côté serveur au premier affichage (SSR),
// puis côté client à chaque changement de l'URL (chemin ou paramètres).
// `status` indique où en est la requête ; `refresh` la relance.
const { data, status, refresh } = await useFetch<
  ProductsResponse<ProductSummary>
>(() => request.value.path, {
  baseURL: API_BASE,
  query: computed(() => request.value.query),
  // Mode `client` (recherche + catégorie) : l'API a renvoyé tous les résultats
  // de la recherche, on garde ceux de la catégorie et on découpe la page.
  // `transform` s'exécute là où la requête a lieu (serveur au premier rendu) :
  // seule la page affichée est envoyée au navigateur.
  transform: (response) =>
    request.value.mode === 'client'
      ? paginateLocally(response, filters.value)
      : response,
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

// Nouveau filtre ou tri : on revient en page 1.
// `push` ici : chaque choix est une vraie étape de navigation,
// le bouton retour doit ramener au filtre précédent.
function onFiltersChange(value: CatalogFiltersValue): void {
  router.push({
    query: {
      ...route.query,
      category: value.category || undefined,
      sortBy: value.sort?.sortBy,
      order: value.sort?.order,
      page: undefined,
    },
  })
}

// Lien « tout le catalogue » : sans recherche ni catégorie, en page 1.
const resetLink = computed(() => ({
  query: {
    ...route.query,
    q: undefined,
    category: undefined,
    page: undefined,
  },
}))

useSeoMeta({
  title: () =>
    filters.value.search
      ? `Recherche « ${filters.value.search} » – page ${filters.value.page} | ChampaShop`
      : `Catalogue – page ${filters.value.page} | ChampaShop`,
  description:
    'Découvrez le catalogue ChampaShop : beauté, maison, épicerie et plus encore.',
})
</script>

<template>
  <section>
    <h1>Catalogue</h1>

    <CatalogSearch :value="filters.search" @search="onSearch" />

    <CatalogFilters
      :categories="categories"
      :category="filters.category"
      :sort="filters.sort"
      :search="filters.search"
      @change="onFiltersChange"
    />

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

    <!-- Aucun résultat (recherche ou catégorie sans résultat, ?page=99…) -->
    <div v-else-if="viewState === 'empty'" class="empty" role="status">
      <p v-if="filters.search">
        Aucun produit ne correspond à « {{ filters.search }} ».
      </p>
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

      <AppPagination :current-page="filters.page" :total-pages="totalPages" />
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
