import { describe, expect, it } from 'vitest'
import { computeCart, type CartLine } from '../../utils/promotions'

describe('computeCart — scénarios imposés', () => {
  it('1. 3x beauty à 9,99€, pas de code', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'beauty', unitPriceCents: 999, quantity: 3 },
    ]
    const result = computeCart(lines)
    expect(result.grossCents).toBe(2997)
    expect(result.totalCents).toBe(3187)
  })

  it('2. 3x beauty à 19,99€, TROYES10', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'beauty', unitPriceCents: 1999, quantity: 3 },
    ]
    const result = computeCart(lines, 'TROYES10')
    expect(result.grossCents).toBe(5997)
    expect(result.totalCents).toBe(4988)
  })

  it('3. 1x beauty 39€ + 1x groceries 15€, TROYES10', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'beauty', unitPriceCents: 3900, quantity: 1 },
      {
        productId: 2,
        category: 'groceries',
        unitPriceCents: 1500,
        quantity: 1,
      },
    ]
    const result = computeCart(lines, 'TROYES10')
    expect(result.grossCents).toBe(5400)
    expect(result.totalCents).toBe(4890)
  })

  it('4. 1x furniture 89,99€, TROYES10 (pas de livraison offerte)', () => {
    const lines: CartLine[] = [
      {
        productId: 1,
        category: 'furniture',
        unitPriceCents: 8999,
        quantity: 1,
      },
    ]
    const result = computeCart(lines, 'TROYES10')
    expect(result.totalCents).toBe(8489)
  })

  it('5. 2x laptops 45€, TROYES10 (livraison offerte)', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'laptops', unitPriceCents: 4500, quantity: 2 },
    ]
    const result = computeCart(lines, 'TROYES10')
    expect(result.shippingCents).toBe(0)
    expect(result.totalCents).toBe(8000)
  })

  it('6. 4x beauty 12,50€, TROYES10 refusé', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'beauty', unitPriceCents: 1250, quantity: 4 },
    ]
    const result = computeCart(lines, 'TROYES10')
    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.totalCents).toBe(4990)
  })

  it('7. 2x groceries 30€, code " troyes10 "', () => {
    const lines: CartLine[] = [
      {
        productId: 1,
        category: 'groceries',
        unitPriceCents: 3000,
        quantity: 2,
      },
    ]
    const result = computeCart(lines, ' troyes10 ')
    expect(result.totalCents).toBe(5490)
  })

  it('8. 1x groceries 79,99€, pas de code', () => {
    const lines: CartLine[] = [
      {
        productId: 1,
        category: 'groceries',
        unitPriceCents: 7999,
        quantity: 1,
      },
    ]
    const result = computeCart(lines)
    expect(result.totalCents).toBe(8489)
  })
})

describe('computeCart — plafond à 25%', () => {
  it('réduit le code promo quand beauté + code dépasseraient le plafond', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'beauty', unitPriceCents: 1999, quantity: 3 },
    ]
    const result = computeCart(lines, 'TROYES10')
    const codeDiscount = result.discounts.find((d) => d.id === 'TROYES10')
    expect(codeDiscount?.amountCents).toBe(899)
  })
})

describe('computeCart — cas limites', () => {
  it('panier vide', () => {
    const result = computeCart([])
    expect(result.grossCents).toBe(0)
    expect(result.totalCents).toBe(490)
  })

  it('code promo inconnu', () => {
    const lines: CartLine[] = [
      {
        productId: 1,
        category: 'groceries',
        unitPriceCents: 6000,
        quantity: 1,
      },
    ]
    const result = computeCart(lines, 'INCONNU')
    expect(result.discounts).toEqual([])
    expect(result.messages.length).toBeGreaterThan(0)
  })

  it('quantité à 0', () => {
    const lines: CartLine[] = [
      { productId: 1, category: 'beauty', unitPriceCents: 1000, quantity: 0 },
    ]
    const result = computeCart(lines)
    expect(result.grossCents).toBe(0)
  })
})
