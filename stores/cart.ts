import { defineStore } from 'pinia'
import { computeCart } from '~/utils/promotions'
import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  getItemCount,
  toCartLines,
  toMinimalCartItems,
  productToCartItem,
  type CartItem,
  type MinimalCartItem
} from '~/utils/cart'
import type { Product } from '~/types/dummyjson'

const CART_COOKIE_NAME = 'champashop_cart'
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 jours

export const useCartStore = defineStore('cart', () => {
  const cartCookie = useCookie<MinimalCartItem[]>(CART_COOKIE_NAME, {
    default: () => [],
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax'
  })

  const items = ref<CartItem[]>([])
  const promoCode = ref<string | undefined>(undefined)
  const hydrated = ref(false)

  // Reconstruit le panier affiché à partir du cookie minimal, en
  // re-téléchargeant chaque produit (titre, prix, stock, image).
  async function hydrate(): Promise<void> {
    if (hydrated.value) return
    if (cartCookie.value.length === 0) {
      hydrated.value = true
      return
    }
    const results = await Promise.all(
      cartCookie.value.map(async (entry) => {
        try {
          const product = await $fetch<Product>(`/products/${entry.productId}`, {
            baseURL: API_BASE
          })
          return {
            ...productToCartItem(product),
            quantity: Math.min(entry.quantity, product.stock)
          }
        } catch {
          return null
        }
      })
    )
    items.value = results.filter((item): item is CartItem => item !== null)
    hydrated.value = true
  }

  if (import.meta.client) {
    hydrate()
  }

  watch(
    items,
    (value) => {
      cartCookie.value = toMinimalCartItems(value)
    },
    { deep: true }
  )

  function addItem(product: Omit<CartItem, 'quantity'>, quantity = 1): void {
    items.value = addItemToCart(items.value, product, quantity)
  }

  function removeItem(productId: number): void {
    items.value = removeItemFromCart(items.value, productId)
  }

  function updateQuantity(productId: number, quantity: number): void {
    items.value = updateItemQuantity(items.value, productId, quantity)
  }

  function applyPromoCode(code: string | undefined): void {
    promoCode.value = code
  }

  function clearCart(): void {
    items.value = []
    promoCode.value = undefined
  }

  const itemCount = computed(() => getItemCount(items.value))
  const summary = computed(() => computeCart(toCartLines(items.value), promoCode.value))

  return {
    items,
    promoCode,
    itemCount,
    summary,
    hydrated,
    hydrate,
    addItem,
    removeItem,
    updateQuantity,
    applyPromoCode,
    clearCart
  }
})