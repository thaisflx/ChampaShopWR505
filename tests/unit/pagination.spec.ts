import { describe, expect, it } from 'vitest'
import {
  PAGE_SIZE,
  countPages,
  pageToSkip,
  parsePage,
} from '../../utils/pagination'

describe('parsePage', () => {
  it('lit un numéro de page valide', () => {
    expect(parsePage('3')).toBe(3)
  })

  it('renvoie 1 quand le paramètre est absent', () => {
    expect(parsePage(undefined)).toBe(1)
    expect(parsePage(null)).toBe(1)
  })

  it.each(['abc', '0', '-2', '1.5', ''])(
    'renvoie 1 pour la valeur invalide "%s"',
    (value) => {
      expect(parsePage(value)).toBe(1)
    },
  )

  it('prend la première valeur si le paramètre est répété (?page=2&page=5)', () => {
    expect(parsePage(['2', '5'])).toBe(2)
  })
})

describe('pageToSkip', () => {
  it('la page 1 commence au premier produit', () => {
    expect(pageToSkip(1)).toBe(0)
  })

  it('la page 3 saute les 24 premiers produits', () => {
    expect(pageToSkip(3)).toBe(2 * PAGE_SIZE)
  })
})

describe('countPages', () => {
  it('arrondit au supérieur', () => {
    expect(countPages(194)).toBe(17)
  })

  it('renvoie au moins 1 page, même sans produit', () => {
    expect(countPages(0)).toBe(1)
  })

  it('ne crée pas de page vide quand le total tombe juste', () => {
    expect(countPages(24)).toBe(2)
  })
})
