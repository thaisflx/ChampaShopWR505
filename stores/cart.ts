import { defineStore } from 'pinia'
import { computeCart } from '~/utils/promotions'
import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  getItemCount,
  toCartLines,
  type CartItem
} from '~/utils/cart'

const CART_COOKIE_NAME = 'champashop_cart'
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 jours

export const useCartStore = defineStore('cart', () => {
  const cartCookie = useCookie<CartItem[]>(CART_COOKIE_NAME, {
    default: () => [],
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax'
  })

  const items = ref<CartItem[]>(cartCookie.value ?? [])
  const promoCode = ref<string | undefined>(undefined)

  watch(
    items,
    (value) => {
      cartCookie.value = value
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
    addItem,
    removeItem,
    updateQuantity,
    applyPromoCode,
    clearCart
  }
})