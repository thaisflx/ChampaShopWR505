import { describe, expect, it } from 'vitest'
import { formatDiscount, formatPrice, formatRating } from '../../utils/format'

// Intl utilise des espaces insécables (U+00A0, U+202F) :
// on les remplace par des espaces normaux pour comparer.
const normalizeSpaces = (text: string): string => text.replace(/\s/g, ' ')

describe('formatPrice', () => {
  it('formate en euros, à la française', () => {
    expect(normalizeSpaces(formatPrice(9.99))).toBe('9,99 €')
  })

  it('affiche toujours deux décimales', () => {
    expect(normalizeSpaces(formatPrice(45))).toBe('45,00 €')
  })
})

describe('formatDiscount', () => {
  it('arrondit la remise à l’entier', () => {
    expect(formatDiscount(10.48)).toBe('−10 %')
    expect(formatDiscount(12.5)).toBe('−13 %')
  })

  it('ne renvoie pas de badge pour une remise nulle', () => {
    expect(formatDiscount(0)).toBeNull()
    expect(formatDiscount(0.4)).toBeNull()
  })
})

describe('formatRating', () => {
  it('affiche une décimale avec une virgule', () => {
    expect(formatRating(2.56)).toBe('2,6')
    expect(formatRating(4)).toBe('4,0')
  })
})
