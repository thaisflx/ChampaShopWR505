<script setup lang="ts">
import type { Product } from '~/types/dummyjson'

// Nouvelle instance de la page à chaque produit (/produits/1 → /produits/2).
definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const productId = parseProductId(route.params.id)

// /produits/abc : pas la peine d'appeler l'API, c'est une 404.
if (productId === null) {
  throw createError({
    status: 404,
    statusText: 'Produit introuvable',
    fatal: true,
  })
}

const { data: product, error } = await useFetch<Product>(
  `/products/${productId}`,
  { baseURL: API_BASE },
)

// Identifiant inexistant : DummyJSON répond 404, on renvoie une vraie 404.
if (error.value || !product.value) {
  const notFound = error.value?.status === 404
  throw createError({
    status: notFound ? 404 : 500,
    statusText: notFound
      ? 'Produit introuvable'
      : 'Impossible de charger le produit',
    fatal: true,
  })
}

// Visite d'une fiche existante (la 404 est déjà passée) : on l'ajoute à l'historique.
const recentlyViewed = useRecentlyViewedStore()
recentlyViewed.add(product.value.id)

const stock = computed(() => getStockStatus(product.value?.stock ?? 0))

useSeoMeta({
  title: () => `${product.value?.title ?? 'Produit'} | ChampaShop`,
  description: () => product.value?.description ?? '',
  ogTitle: () => product.value?.title ?? 'ChampaShop',
  ogDescription: () => product.value?.description ?? '',
  ogImage: () => product.value?.thumbnail ?? '',
})

const cartStore = useCartStore()
const justAdded = ref(false)
const stockLimitReached = ref(false)
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined

function handleAddToCart(): void {
  if (!product.value || !stock.value.canAddToCart) return
  const alreadyInCart = cartStore.items.find(
    (item) => item.productId === product.value!.id,
  )
  const currentQuantity = alreadyInCart?.quantity ?? 0

  if (currentQuantity >= product.value.stock) {
    stockLimitReached.value = true
  } else {
    cartStore.addItem(productToCartItem(product.value))
    justAdded.value = true
  }

  clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => {
    justAdded.value = false
    stockLimitReached.value = false
  }, 2000)
}
</script>

<template>
  <article v-if="product" class="product">
    <p class="product__back">
      <NuxtLink to="/produits">← Retour au catalogue</NuxtLink>
    </p>

    <div class="product__layout">
      <ProductGallery :images="product.images" :title="product.title" />

      <div class="product__info">
        <p v-if="product.brand" class="product__brand">{{ product.brand }}</p>
        <h1 class="product__title">{{ product.title }}</h1>

        <p class="product__rating">
          <span aria-hidden="true">★</span>
          <span class="visually-hidden">Note :</span>
          {{ formatRating(product.rating) }}
          <span class="visually-hidden">sur 5</span>
        </p>

        <p class="product__price">{{ formatPrice(product.price) }}</p>

        <p class="product__description">{{ product.description }}</p>

        <p
          class="product__stock"
          :class="{
            'product__stock--low': stock.isLow,
            'product__stock--out': !stock.canAddToCart,
          }"
        >
          {{ stock.label }}
        </p>

        <button
          type="button"
          class="product__add"
          :class="{
            'product__add--added': justAdded,
            'product__add--limit': stockLimitReached,
          }"
          :disabled="!stock.canAddToCart"
          @click="handleAddToCart"
        >
          {{
            stockLimitReached
              ? 'Stock maximum atteint'
              : justAdded
                ? 'Ajouté ✓'
                : 'Ajouter au panier'
          }}
        </button>

        <CompareButton :product-id="product.id" :title="product.title" />

        <dl class="product__details">
          <dt>Garantie</dt>
          <dd>{{ product.warrantyInformation }}</dd>
          <dt>Livraison</dt>
          <dd>{{ product.shippingInformation }}</dd>
        </dl>
      </div>
    </div>

    <RecentlyViewed :exclude-id="product.id" />
  </article>
</template>

<style scoped>
.product__back {
  margin: 0 0 1rem;
}

.product__layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.product__brand {
  margin: 0;
  color: #444;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.product__title {
  margin: 0.25rem 0 0.5rem;
}

.product__rating,
.product__description {
  margin: 0 0 1rem;
}

.product__price {
  margin: 0 0 1rem;
  font-weight: 700;
  font-size: 1.5rem;
}

.product__stock {
  margin: 0 0 1rem;
  font-weight: 600;
  color: #1b6b2f;
}

.product__stock--low {
  color: #8a4b00;
}

.product__stock--out {
  color: #b3261e;
}

.product__add--limit {
  background: #8a4b00;
}

.product__add {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  background: #1a4fd8;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.product__add:disabled {
  background: #767676;
  cursor: not-allowed;
}

.product__add--added {
  background: #1b6b2f;
}

.product__add:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 3px;
}

.product__details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  margin: 1.5rem 0 0;
}

.product__details dt {
  font-weight: 600;
}

.product__details dd {
  margin: 0;
}
</style>
