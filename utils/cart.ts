import type { CartLine } from './promotions'
import type { Product } from '../types/dummyjson'

export interface CartItem {
  productId: number
  title: string
  category: string
  unitPriceCents: number
  thumbnail?: string
  stock: number
  quantity: number
}

// Ce qu'on garde dans le cookie : juste de quoi reconstruire le panier,
// pour rester largement sous la limite de 4 Ko (le titre/l'image sont
// re-téléchargés depuis l'API à chaque visite, pas stockés).
export interface MinimalCartItem {
  productId: number
  quantity: number
}

export function addItemToCart(
  items: CartItem[],
  product: Omit<CartItem, 'quantity'>,
  quantity = 1,
): CartItem[] {
  const existingIndex = items.findIndex(
    (item) => item.productId === product.productId,
  )
  if (existingIndex === -1) {
    const cappedQuantity = Math.min(quantity, product.stock)
    return cappedQuantity > 0
      ? [...items, { ...product, quantity: cappedQuantity }]
      : items
  }
  return items.map((item, index) =>
    index === existingIndex
      ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) }
      : item,
  )
}

export function removeItemFromCart(
  items: CartItem[],
  productId: number,
): CartItem[] {
  return items.filter((item) => item.productId !== productId)
}

export function updateItemQuantity(
  items: CartItem[],
  productId: number,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return removeItemFromCart(items, productId)
  }
  return items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.min(quantity, item.stock) }
      : item,
  )
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function toCartLines(items: CartItem[]): CartLine[] {
  return items.map(({ productId, category, unitPriceCents, quantity }) => ({
    productId,
    category,
    unitPriceCents,
    quantity,
  }))
}

export function toMinimalCartItems(items: CartItem[]): MinimalCartItem[] {
  return items.map(({ productId, quantity }) => ({ productId, quantity }))
}

export function eurosToCents(amount: number): number {
  return Math.round(amount * 100)
}

export function productToCartItem(
  product: Product,
): Omit<CartItem, 'quantity'> {
  return {
    productId: product.id,
    title: product.title,
    category: product.category,
    unitPriceCents: eurosToCents(product.price),
    thumbnail: product.thumbnail,
    stock: product.stock,
  }
}
