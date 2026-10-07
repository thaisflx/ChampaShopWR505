import { describe, expect, it } from 'vitest'
import {
  parseRecentlyViewedCookie,
  pushRecentlyViewed,
  serializeRecentlyViewed,
} from '../../utils/recentlyViewed'

describe('pushRecentlyViewed', () => {
  it('ajoute le produit en tête de liste', () => {
    expect(pushRecentlyViewed([3, 7], 12)).toEqual([12, 3, 7])
  })

  it('fonctionne avec une liste vide', () => {
    expect(pushRecentlyViewed([], 5)).toEqual([5])
  })

  it('fait remonter un produit déjà présent, sans doublon', () => {
    expect(pushRecentlyViewed([3, 7, 12], 12)).toEqual([12, 3, 7])
  })

  it('garde 10 produits maximum : le plus ancien sort', () => {
    const ten = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(pushRecentlyViewed(ten, 11)).toEqual([
      11, 10, 9, 8, 7, 6, 5, 4, 3, 2,
    ])
  })

  it('accepte un autre maximum', () => {
    expect(pushRecentlyViewed([1, 2, 3], 4, 3)).toEqual([4, 1, 2])
  })

  it('ne modifie pas la liste reçue', () => {
    const ids = [1, 2]
    pushRecentlyViewed(ids, 3)
    expect(ids).toEqual([1, 2])
  })
})

describe('parseRecentlyViewedCookie', () => {
  it('lit une liste valide en gardant l’ordre', () => {
    expect(parseRecentlyViewedCookie('12,3,45')).toEqual([12, 3, 45])
  })

  it('lit un seul identifiant (Nuxt le décode en nombre)', () => {
    expect(parseRecentlyViewedCookie(5)).toEqual([5])
  })

  it('lit un tableau', () => {
    expect(parseRecentlyViewedCookie([4, '8'])).toEqual([4, 8])
  })

  it('supprime les doublons', () => {
    expect(parseRecentlyViewedCookie('5,5,5')).toEqual([5])
  })

  it('ignore les valeurs vides', () => {
    expect(parseRecentlyViewedCookie('1,,2')).toEqual([1, 2])
  })

  it('ignore les valeurs non numériques', () => {
    expect(parseRecentlyViewedCookie('abc')).toEqual([])
    expect(parseRecentlyViewedCookie('3,abc,-1,1.5,0,9')).toEqual([3, 9])
  })

  it('garde 10 identifiants maximum', () => {
    expect(
      parseRecentlyViewedCookie('1,2,3,4,5,6,7,8,9,10,11,12'),
    ).toHaveLength(10)
  })

  it.each([null, undefined, '', [], {}, true])(
    'renvoie une liste vide pour %j',
    (raw) => {
      expect(parseRecentlyViewedCookie(raw)).toEqual([])
    },
  )
})

describe('serializeRecentlyViewed', () => {
  it('sépare les identifiants par des virgules', () => {
    expect(serializeRecentlyViewed([12, 3, 45])).toBe('12,3,45')
  })

  it('donne une chaîne vide pour une liste vide', () => {
    expect(serializeRecentlyViewed([])).toBe('')
  })
})
