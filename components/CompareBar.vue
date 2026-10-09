<script setup lang="ts">
import { PRODUCT_SUMMARY_FIELDS, type ProductSummary } from '~/types/dummyjson'
import { MAX_COMPARE } from '~/utils/compare'

const compare = useCompareStore()

// Même stratégie que « Vus récemment » : un appel par produit, en parallèle,
// avec `select` pour ne télécharger que la miniature et le titre.
// Un produit introuvable n'empêche pas l'affichage des autres.
const { data: products } = await useAsyncData(
  'compare-bar',
  async (): Promise<ProductSummary[]> => {
    const results = await Promise.all(
      compare.ids.map((id) =>
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
  { watch: [() => compare.ids], default: () => [] },
)

// Construit depuis les identifiants du cookie (et non depuis la réponse) :
// le retrait est immédiat et un produit pas encore chargé reste retirable.
const items = computed(() =>
  compare.ids.map((id) => ({
    id,
    product: products.value.find((product) => product.id === id) ?? null,
  })),
)

const compareLink = computed(() => ({
  path: '/comparer',
  query: { ids: compare.ids.join(',') },
}))

const removeButtons = ref<HTMLButtonElement[]>([])
const link = ref<{ $el: HTMLElement } | null>(null)

// Le bouton cliqué disparaît : on replace le focus dans la barre
// pour que la navigation au clavier ne reparte pas du début de la page.
async function remove(id: number): Promise<void> {
  compare.toggle(id)
  await nextTick()
  const next = removeButtons.value[0]
  if (next) next.focus()
  else link.value?.$el.focus()
}
</script>

<template>
  <section
    v-if="compare.count > 0"
    class="compare-bar"
    aria-labelledby="compare-bar-title"
  >
    <h2 id="compare-bar-title" class="visually-hidden">
      Produits sélectionnés pour la comparaison
    </h2>

    <ul class="compare-bar__list">
      <li v-for="item in items" :key="item.id" class="compare-bar__item">
        <img
          v-if="item.product"
          :src="item.product.thumbnail"
          alt=""
          width="48"
          height="48"
          class="compare-bar__thumb"
        />
        <span class="compare-bar__name">
          {{ item.product?.title ?? `Produit n° ${item.id}` }}
        </span>
        <button
          ref="removeButtons"
          type="button"
          class="compare-bar__remove"
          :aria-label="`Retirer ${item.product?.title ?? `le produit n° ${item.id}`} du comparateur`"
          @click="remove(item.id)"
        >
          <span aria-hidden="true">×</span>
        </button>
      </li>
    </ul>

    <NuxtLink ref="link" :to="compareLink" class="compare-bar__link">
      Comparer ({{ compare.count }}/{{ MAX_COMPARE }})
    </NuxtLink>
  </section>
</template>

<style scoped>
.compare-bar {
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  border-top: 1px solid #d0d0d0;
  background: #fff;
  box-shadow: 0 -2px 8px rgb(0 0 0 / 8%);
}

.compare-bar__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.compare-bar__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 16rem;
  padding: 0.25rem 0.25rem 0.25rem 0.5rem;
  border: 1px solid #d0d0d0;
  border-radius: 0.5rem;
}

.compare-bar__thumb {
  flex-shrink: 0;
  object-fit: contain;
}

.compare-bar__name {
  overflow: hidden;
  font-size: 0.875rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.compare-bar__remove {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border: 1px solid #767676;
  border-radius: 50%;
  background: #fff;
  font: inherit;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
}

.compare-bar__link {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: #1a4fd8;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.compare-bar__remove:focus-visible,
.compare-bar__link:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .compare-bar {
    padding: 0.75rem 1rem;
  }

  .compare-bar__name {
    /* Sur mobile, la miniature suffit : le titre reste lu via le bouton. */
    display: none;
  }
}
</style>
