import { describe, expect, it } from 'vitest'
import { getStockStatus, parseProductId } from '../../utils/product'

describe('getStockStatus', () => {
  it('affiche « Rupture de stock » et bloque le bouton à 0', () => {
    expect(getStockStatus(0)).toEqual({
      label: 'Rupture de stock',
      canAddToCart: false,
      isLow: false,
    })
  })

  it('affiche « Plus que X en stock » en dessous de 5', () => {
    expect(getStockStatus(4)).toEqual({
      label: 'Plus que 4 en stock',
      canAddToCart: true,
      isLow: true,
    })
    expect(getStockStatus(1).label).toBe('Plus que 1 en stock')
  })

  it('affiche « En stock » à partir de 5', () => {
    expect(getStockStatus(5)).toEqual({
      label: 'En stock',
      canAddToCart: true,
      isLow: false,
    })
  })

  it('traite un stock négatif comme une rupture', () => {
    expect(getStockStatus(-2).canAddToCart).toBe(false)
  })
})

describe('parseProductId', () => {
  it('lit un identifiant valide', () => {
    expect(parseProductId('12')).toBe(12)
  })

  it('prend la première valeur si on reçoit un tableau', () => {
    expect(parseProductId(['7', '8'])).toBe(7)
  })

  it.each(['abc', '0', '-3', '1.5', '', undefined])(
    'renvoie null pour « %s »',
    (value) => {
      expect(parseProductId(value)).toBeNull()
    },
  )
})
