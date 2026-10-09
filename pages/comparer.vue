<script setup lang="ts">
import {
  COMPARED_PRODUCT_FIELDS,
  type ComparedProduct,
} from '~/types/dummyjson'
import type { ProductLoadResult } from '~/utils/comparison'

const route = useRoute()
const compare = useCompareStore()

// ---------------------------------------------------------------------------
// 1. L'URL est la source de vérité : /comparer?ids=3,17,42
// ---------------------------------------------------------------------------
const ids = computed(() => parseCompareIds(route.query.ids))

function idsQuery(list: number[]): { ids?: string } {
  return list.length > 0 ? { ids: list.join(',') } : {}
}

// URL invalide (« 3,abc,3,17,42,8 ») : on la réécrit proprement.
// `replace` : l'URL invalide ne reste pas dans l'historique.
// En SSR, navigateTo renvoie une redirection : pas d'erreur 500.
async function normalizeUrl(): Promise<void> {
  if (needsNormalization(route.query.ids, ids.value)) {
    await navigateTo(
      { path: '/comparer', query: idsQuery(ids.value) },
      { replace: true },
    )
  }
}

await normalizeUrl()
watch(() => route.query.ids, normalizeUrl)

// ---------------------------------------------------------------------------
// 2. Chargement des produits, en parallèle
// ---------------------------------------------------------------------------
// DummyJSON n'a pas d'endpoint « plusieurs produits par identifiants » :
// un appel par produit (3 au maximum), lancés en même temps, avec `select`
// pour ne télécharger que les champs du tableau.
// Chaque appel attrape sa propre erreur : un produit en échec n'empêche
// jamais l'affichage des autres (même principe que Promise.allSettled).
async function loadProduct(id: number): Promise<ProductLoadResult> {
  try {
    const product = await $fetch<ComparedProduct>(`/products/${id}`, {
      baseURL: API_BASE,
      query: { select: COMPARED_PRODUCT_FIELDS.join(',') },
    })
    return { id, status: 'ok', product }
  } catch (error: unknown) {
    return { id, status: classifyLoadError(error) }
  }
}

const {
  data: results,
  status,
  refresh,
} = await useAsyncData(
  'compare-page',
  (): Promise<ProductLoadResult[]> => Promise.all(ids.value.map(loadProduct)),
  { watch: [ids], default: (): ProductLoadResult[] => [] },
)

const products = computed(() =>
  results.value.flatMap((result) =>
    result.status === 'ok' ? [result.product] : [],
  ),
)
const failedIds = computed(() =>
  results.value
    .filter((result) => result.status === 'error')
    .map((result) => result.id),
)
const notFoundIds = computed(() =>
  results.value
    .filter((result) => result.status === 'not-found')
    .map((result) => result.id),
)

// Identifiants inexistants (404) : retirés de l'URL, comme les invalides.
// Un échec réseau, lui, n'est pas une preuve d'inexistence : on garde l'id.
async function dropNotFound(): Promise<void> {
  if (notFoundIds.value.length === 0) return
  const kept = ids.value.filter((id) => !notFoundIds.value.includes(id))
  await navigateTo(
    { path: '/comparer', query: idsQuery(kept) },
    { replace: true },
  )
}

await dropNotFound()
watch(notFoundIds, dropNotFound)

const isLoading = computed(
  () => status.value === 'pending' && products.value.length === 0,
)

// ---------------------------------------------------------------------------
// 3. Conflit entre la sélection du visiteur (cookie) et l'URL
// ---------------------------------------------------------------------------
// Lien reçu d'un tiers : on affiche ce que dit l'URL, et on PROPOSE de
// remplacer la sélection du visiteur. Jamais sans son accord.
const hasConflict = computed(
  () => ids.value.length > 0 && !isSameSelection(compare.ids, ids.value),
)
const replaceMessage = ref('')

function replaceSelection(): void {
  compare.replace(ids.value)
  replaceMessage.value = 'Votre sélection a été remplacée par celle-ci.'
}

const mySelectionLink = computed(() => ({
  path: '/comparer',
  query: idsQuery(compare.ids),
}))

// ---------------------------------------------------------------------------
// 4. Lien à partager
// ---------------------------------------------------------------------------
// useRequestURL fonctionne côté serveur ET client : même lien dans les deux.
const requestUrl = useRequestURL()
const shareUrl = computed(() => new URL(route.fullPath, requestUrl.origin).href)

useSeoMeta({
  title: () =>
    products.value.length > 0
      ? `Comparer ${products.value.length} produits | ChampaShop`
      : 'Comparateur | ChampaShop',
  description: 'Comparez jusqu’à 3 produits ChampaShop côte à côte.',
})
</script>

<template>
  <section class="compare-page">
    <h1>Comparateur</h1>

    <!-- Zone d'annonce, toujours présente. -->
    <p
      class="compare-page__status"
      :class="{ 'compare-page__status--hidden': !replaceMessage }"
      aria-live="polite"
    >
      {{ replaceMessage }}
    </p>

    <!-- État vide -->
    <div v-if="ids.length === 0" class="compare-page__empty">
      <p>Aucun produit à comparer.</p>
      <p>
        <NuxtLink to="/produits">Parcourir le catalogue</NuxtLink>
      </p>
      <p v-if="compare.ids.length > 0">
        <NuxtLink :to="mySelectionLink">
          Voir ma sélection ({{ compare.ids.length }})
        </NuxtLink>
      </p>
    </div>

    <template v-else>
      <!-- Conflit cookie / URL -->
      <div
        v-if="hasConflict"
        class="compare-page__conflict"
        role="region"
        aria-label="Sélection différente"
      >
        <p>
          {{
            compare.ids.length > 0
              ? 'Cette comparaison est différente de votre sélection.'
              : 'Vous n’avez pas encore de sélection.'
          }}
        </p>
        <button type="button" @click="replaceSelection">
          {{
            compare.ids.length > 0
              ? 'Remplacer ma sélection par celle-ci'
              : 'Utiliser cette sélection'
          }}
        </button>
      </div>

      <CopyLinkButton :url="shareUrl" />

      <!-- Produits en échec (réseau) : les autres restent affichés. -->
      <ErrorMessage
        v-if="failedIds.length > 0"
        :message="`Impossible de charger ${failedIds.length === 1 ? 'le produit' : 'les produits'} n° ${failedIds.join(', ')}.`"
        @retry="refresh()"
      />

      <p v-if="isLoading" role="status">Chargement de la comparaison…</p>

      <ComparisonTable v-else-if="products.length > 0" :products="products" />
    </template>
  </section>
</template>

<style scoped>
.compare-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* La page ne doit jamais déborder : seul le tableau défile. */
  min-width: 0;
}

.compare-page h1 {
  margin-bottom: 0;
}

.compare-page__status {
  margin: 0;
  color: #1b6b2f;
  font-weight: 600;
}

.compare-page__status--hidden {
  margin: 0;
  padding: 0;
}

.compare-page__empty {
  padding: 2rem;
  text-align: center;
}

.compare-page__conflict {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #8a4b00;
  border-radius: 0.5rem;
  background: #fff6e5;
}

.compare-page__conflict p {
  margin: 0;
}

.compare-page__conflict button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background: #1a4fd8;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.compare-page__conflict button:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}
</style>
