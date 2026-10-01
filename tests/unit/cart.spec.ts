import { describe, expect, it } from 'vitest'
import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  getItemCount,
  toCartLines,
  eurosToCents,
  productToCartItem,
  type CartItem
} from '../../utils/cart'
import type { Product } from '../../types/dummyjson'

const productA: Omit<CartItem, 'quantity'> = {
  productId: 1,
  title: 'Crème hydratante',
  category: 'beauty',
  unitPriceCents: 1999,
}

const productB: Omit<CartItem, 'quantity'> = {
  productId: 2,
  title: 'Café en grains',
  category: 'groceries',
  unitPriceCents: 1200,
}

describe('addItemToCart', () => {
  it('ajoute un nouvel article', () => {
    const result = addItemToCart([], productA, 2)
    expect(result).toEqual([{ ...productA, quantity: 2 }])
  })

  it('incrémente la quantité si l’article existe déjà', () => {
    const initial: CartItem[] = [{ ...productA, quantity: 1 }]
    const result = addItemToCart(initial, productA, 2)
    expect(result).toEqual([{ ...productA, quantity: 3 }])
  })
})

describe('removeItemFromCart', () => {
  it('retire l’article ciblé', () => {
    const initial: CartItem[] = [
      { ...productA, quantity: 1 },
      { ...productB, quantity: 1 },
    ]
    const result = removeItemFromCart(initial, 1)
    expect(result).toEqual([{ ...productB, quantity: 1 }])
  })

  it('ne fait rien si l’article n’existe pas', () => {
    const initial: CartItem[] = [{ ...productA, quantity: 1 }]
    const result = removeItemFromCart(initial, 999)
    expect(result).toEqual(initial)
  })
})

describe('updateItemQuantity', () => {
  it('met à jour la quantité', () => {
    const initial: CartItem[] = [{ ...productA, quantity: 1 }]
    const result = updateItemQuantity(initial, 1, 5)
    expect(result[0].quantity).toBe(5)
  })

  it('retire l’article si la quantité devient 0', () => {
    const initial: CartItem[] = [{ ...productA, quantity: 1 }]
    const result = updateItemQuantity(initial, 1, 0)
    expect(result).toEqual([])
  })

  it('retire l’article si la quantité est négative', () => {
    const initial: CartItem[] = [{ ...productA, quantity: 1 }]
    const result = updateItemQuantity(initial, 1, -3)
    expect(result).toEqual([])
  })
})

describe('getItemCount', () => {
  it('additionne les quantités de toutes les lignes', () => {
    const items: CartItem[] = [
      { ...productA, quantity: 2 },
      { ...productB, quantity: 3 },
    ]
    expect(getItemCount(items)).toBe(5)
  })

  it('retourne 0 pour un panier vide', () => {
    expect(getItemCount([])).toBe(0)
  })
})

describe('toCartLines', () => {
  it('convertit les CartItem en CartLine pour computeCart', () => {
    const items: CartItem[] = [{ ...productA, quantity: 2 }]
    expect(toCartLines(items)).toEqual([
      { productId: 1, category: 'beauty', unitPriceCents: 1999, quantity: 2 },
    ])
  })
})

describe('eurosToCents', () => {
  it('convertit un prix décimal en centimes entiers', () => {
    expect(eurosToCents(9.99)).toBe(999)
    expect(eurosToCents(19.9)).toBe(1990)
  })

  it('arrondit correctement les flottants imprécis', () => {
    expect(eurosToCents(10.1)).toBe(1010)
  })
})

describe('productToCartItem', () => {
  it('convertit un Product DummyJSON en item de panier', () => {
    const product = {
      id: 42,
      title: 'Savon artisanal',
      category: 'beauty',
      price: 12.5,
      thumbnail: 'https://example.com/savon.jpg',
    } as Product

    expect(productToCartItem(product)).toEqual({
      productId: 42,
      title: 'Savon artisanal',
      category: 'beauty',
      unitPriceCents: 1250,
      thumbnail: 'https://example.com/savon.jpg',
    })
  })
})
