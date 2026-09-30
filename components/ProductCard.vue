<script setup lang="ts">
import type { ProductSummary } from '~/types/dummyjson'

const props = defineProps<{
  product: ProductSummary
}>()

const discountLabel = computed(() =>
  formatDiscount(props.product.discountPercentage),
)
</script>

<template>
  <article class="product-card">
    <NuxtLink :to="`/produits/${product.id}`" class="product-card__link">
      <div class="product-card__media">
        <img
          :src="product.thumbnail"
          :alt="product.title"
          width="300"
          height="300"
          loading="lazy"
        />
        <span v-if="discountLabel" class="product-card__badge">
          {{ discountLabel }}
        </span>
      </div>
      <h2 class="product-card__title">{{ product.title }}</h2>
    </NuxtLink>
    <p class="product-card__price">{{ formatPrice(product.price) }}</p>
    <p class="product-card__rating">
      <span aria-hidden="true">★</span>
      <span class="visually-hidden">Note :</span>
      {{ formatRating(product.rating) }}
      <span class="visually-hidden">sur 5</span>
    </p>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #d0d0d0;
  border-radius: 0.5rem;
  background: #fff;
}

.product-card__link {
  color: inherit;
  text-decoration: none;
}

.product-card__link:focus-visible {
  outline: 3px solid #1a4fd8;
  outline-offset: 4px;
}

.product-card__media {
  position: relative;
}

.product-card__media img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
}

.product-card__badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  background: #b3261e;
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
}

.product-card__title {
  margin: 0.5rem 0 0;
  font-size: 1rem;
}

.product-card__price {
  margin: 0;
  font-weight: 700;
  font-size: 1.125rem;
}

.product-card__rating {
  margin: 0;
  color: #444;
}
</style>
