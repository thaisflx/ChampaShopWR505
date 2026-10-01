import type { CartLine } from './promotions'
import type { Product } from '../types/dummyjson'

export interface CartItem {
  productId: number
  title: string
  category: string
  unitPriceCents: number
  thumbnail?: string
  quantity: number
}

export function addItemToCart(
  items: CartItem[],
  product: Omit<CartItem, 'quantity'>,
  quantity = 1
): CartItem[] {
  const existingIndex = items.findIndex((item) => item.productId === product.productId)
  if (existingIndex === -1) {
    return [...items, { ...product, quantity }]
  }
  return items.map((item, index) =>
    index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
  )
}

export function removeItemFromCart(items: CartItem[], productId: number): CartItem[] {
  return items.filter((item) => item.productId !== productId)
}

export function updateItemQuantity(
  items: CartItem[],
  productId: number,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeItemFromCart(items, productId)
  }
  return items.map((item) => (item.productId === productId ? { ...item, quantity } : item))
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function toCartLines(items: CartItem[]): CartLine[] {
  return items.map(({ productId, category, unitPriceCents, quantity }) => ({
    productId,
    category,
    unitPriceCents,
    quantity
  }))
}

export function eurosToCents(amount: number): number {
  return Math.round(amount * 100)
}

export function productToCartItem(product: Product): Omit<CartItem, 'quantity'> {
  return {
    productId: product.id,
    title: product.title,
    category: product.category,
    unitPriceCents: eurosToCents(product.price),
    thumbnail: product.thumbnail
  }
}