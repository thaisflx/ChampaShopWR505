<script setup lang="ts">
const cartStore = useCartStore()
const promoCodeInput = ref('')

useSeoMeta({
  title: 'Mon panier | ChampaShop',
})

function applyPromoCode(): void {
  cartStore.applyPromoCode(promoCodeInput.value.trim() || undefined)
}
</script>

<template>
  <section class="cart">
    <h1>Mon panier</h1>

    <div v-if="cartStore.items.length === 0" class="cart__empty">
      <p>Votre panier est vide.</p>
      <NuxtLink to="/produits">Voir le catalogue</NuxtLink>
    </div>

    <template v-else>
      <ul class="cart__list">
        <li
          v-for="item in cartStore.items"
          :key="item.productId"
          class="cart__item"
        >
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            :alt="item.title"
            width="64"
            height="64"
          />
          <div class="cart__item-info">
            <p class="cart__item-title">{{ item.title }}</p>
            <p class="cart__item-price">
              {{ formatPrice(item.unitPriceCents / 100) }}
            </p>
          </div>

          <label class="cart__item-qty">
            Quantité
            <input
              type="number"
              min="1"
              :value="item.quantity"
              @change="
                cartStore.updateQuantity(
                  item.productId,
                  Number(($event.target as HTMLInputElement).value),
                )
              "
            />
          </label>

          <button type="button" @click="cartStore.removeItem(item.productId)">
            Retirer
          </button>
        </li>
      </ul>

      <form class="cart__promo" @submit.prevent="applyPromoCode">
        <label for="promo">Code promo</label>
        <input
          id="promo"
          v-model="promoCodeInput"
          type="text"
          placeholder="TROYES10"
        />
        <button type="submit">Appliquer</button>
      </form>

      <ul
        v-if="cartStore.summary.messages.length"
        class="cart__messages"
        role="alert"
      >
        <li v-for="message in cartStore.summary.messages" :key="message">
          {{ message }}
        </li>
      </ul>

      <dl class="cart__summary">
        <dt>Sous-total</dt>
        <dd>{{ formatPrice(cartStore.summary.grossCents / 100) }}</dd>

        <template
          v-for="discount in cartStore.summary.discounts"
          :key="discount.id"
        >
          <dt>{{ discount.label }}</dt>
          <dd>−{{ formatPrice(discount.amountCents / 100) }}</dd>
        </template>

        <dt>Livraison</dt>
        <dd>
          {{
            cartStore.summary.shippingCents === 0
              ? 'Offerte'
              : formatPrice(cartStore.summary.shippingCents / 100)
          }}
        </dd>

        <dt class="cart__total-label">Total</dt>
        <dd class="cart__total-value">
          {{ formatPrice(cartStore.summary.totalCents / 100) }}
        </dd>
      </dl>
    </template>
  </section>
</template>

<style scoped>
.cart__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.cart__item-info {
  flex: 1;
}

.cart__item-qty input {
  width: 4rem;
}

.cart__summary {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 1rem;
  margin-top: 1.5rem;
}

.cart__total-label,
.cart__total-value {
  font-weight: 700;
  font-size: 1.25rem;
}
</style>
