<script setup lang="ts">
import type { ComparedProduct } from '~/types/dummyjson'

const props = defineProps<{
  products: ComparedProduct[]
}>()

const showOnlyDifferences = ref(false)

const rows = computed(() => buildComparisonRows(props.products))
const visibleRows = computed(() =>
  showOnlyDifferences.value ? onlyDifferences(rows.value) : rows.value,
)
const hiddenCount = computed(() => rows.value.length - visibleRows.value.length)
</script>

<template>
  <div class="comparison">
    <label class="comparison__option">
      <input
        v-model="showOnlyDifferences"
        type="checkbox"
        :disabled="products.length < 2"
      />
      Afficher uniquement les différences
    </label>

    <p v-if="showOnlyDifferences" class="comparison__hint" role="status">
      {{
        hiddenCount === 0
          ? 'Aucune ligne identique à masquer.'
          : `${hiddenCount} ligne(s) identique(s) masquée(s).`
      }}
    </p>

    <!--
      Conteneur défilant : sur mobile, c'est lui qui défile horizontalement,
      pas la page. tabindex="0" + role="region" + nom : on peut le faire défiler
      au clavier (flèches) et un lecteur d'écran l'annonce.
    -->
    <div
      class="comparison__scroll"
      role="region"
      aria-labelledby="comparison-caption"
      tabindex="0"
    >
      <table class="comparison__table">
        <caption id="comparison-caption">
          Comparaison de
          {{
            products.length
          }}
          produit(s)
        </caption>

        <thead>
          <tr>
            <th scope="col">Caractéristique</th>
            <th v-for="product in products" :key="product.id" scope="col">
              <NuxtLink :to="`/produits/${product.id}`">
                {{ product.title }}
              </NuxtLink>
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- L'image est toujours affichée : elle aide à repérer les colonnes. -->
          <tr>
            <th scope="row">Image</th>
            <td v-for="product in products" :key="product.id">
              <!-- alt vide : le titre est déjà dans l'en-tête de la colonne. -->
              <img
                :src="product.thumbnail"
                alt=""
                width="120"
                height="120"
                loading="lazy"
              />
            </td>
          </tr>

          <tr v-for="row in visibleRows" :key="row.key">
            <th scope="row">{{ row.label }}</th>
            <td
              v-for="(value, index) in row.values"
              :key="`${row.key}-${index}`"
              :class="{ 'comparison__cell--best': row.best[index] }"
            >
              {{ value }}
              <!-- Un libellé texte, pas seulement une couleur. -->
              <strong
                v-if="row.best[index] && row.bestLabel"
                class="comparison__badge"
              >
                {{ row.bestLabel }}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.comparison__option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.comparison__hint {
  margin: 0 0 0.75rem;
  color: #444;
}

/* Le conteneur ne dépasse jamais la largeur de la page :
   c'est lui qui défile, pas le body. */
.comparison__scroll {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid #d0d0d0;
  border-radius: 0.5rem;
  background: #fff;
}

.comparison__scroll:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 2px;
}

.comparison__table {
  width: 100%;
  border-collapse: collapse;
}

.comparison__table caption {
  padding: 0.75rem;
  font-weight: 700;
  text-align: left;
}

.comparison__table th,
.comparison__table td {
  min-width: 10rem;
  padding: 0.75rem;
  border-top: 1px solid #e4e4e4;
  text-align: left;
  vertical-align: top;
}

.comparison__table img {
  display: block;
  object-fit: contain;
}

/* Première colonne figée : on garde le nom de la caractéristique
   sous les yeux pendant le défilement horizontal. */
.comparison__table th:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 8rem;
  background: #f7f7f7;
}

.comparison__cell--best {
  background: #e8f3ea;
}

.comparison__badge {
  display: block;
  margin-top: 0.25rem;
  color: #1b6b2f;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .comparison__table th,
  .comparison__table td {
    min-width: 8rem;
    padding: 0.5rem;
  }

  .comparison__table th:first-child {
    min-width: 6.5rem;
  }
}
</style>
