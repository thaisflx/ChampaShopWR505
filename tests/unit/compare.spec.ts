import { describe, expect, it } from 'vitest'
import { parseCompareIds, toggleCompare } from '../../utils/compare'

describe('parseCompareIds', () => {
  it('lit une liste d’identifiants valides dans l’ordre', () => {
    expect(parseCompareIds('3,17,42')).toEqual([3, 17, 42])
  })

  it('supprime les doublons', () => {
    expect(parseCompareIds('5,5,5')).toEqual([5])
    expect(parseCompareIds('1,2,1')).toEqual([1, 2])
  })

  it('ignore les valeurs vides ou non numériques', () => {
    expect(parseCompareIds('abc')).toEqual([])
    expect(parseCompareIds('1,,2')).toEqual([1, 2])
    expect(parseCompareIds('1,abc,2')).toEqual([1, 2])
    expect(parseCompareIds('-3,0,1.5,4')).toEqual([4])
  })

  it('limite au maximum autorisé', () => {
    expect(parseCompareIds('1,2,3,4,5')).toEqual([1, 2, 3])
    expect(parseCompareIds('1,2,3,4', 2)).toEqual([1, 2])
  })

  it('tolère null, undefined, tableau vide et types inattendus', () => {
    expect(parseCompareIds(null)).toEqual([])
    expect(parseCompareIds(undefined)).toEqual([])
    expect(parseCompareIds([])).toEqual([])
    expect(parseCompareIds('')).toEqual([])
    expect(parseCompareIds(true)).toEqual([])
    expect(parseCompareIds({})).toEqual([])
  })

  it('accepte un paramètre répété dans l’URL (tableau de chaînes)', () => {
    expect(parseCompareIds(['1', '2,3'])).toEqual([1, 2, 3])
  })

  it('lit un nombre seul (cookie à un seul identifiant)', () => {
    expect(parseCompareIds(42)).toEqual([42])
  })

  it('lit un tableau de nombres (cookie JSON)', () => {
    expect(parseCompareIds([3, 17])).toEqual([3, 17])
  })

  it('lit un tableau mixte de chaînes et de nombres', () => {
    expect(parseCompareIds(['1', 2, '3,4'])).toEqual([1, 2, 3])
  })

  it('ignore les nombres invalides et les autres types dans un tableau', () => {
    expect(parseCompareIds([0, -1, 1.5, Number.NaN, true, {}, 7])).toEqual([7])
  })

  it('supprime les doublons entre nombres et chaînes', () => {
    expect(parseCompareIds([5, '5', 5])).toEqual([5])
  })

  it('limite aussi un tableau de nombres au maximum autorisé', () => {
    expect(parseCompareIds([1, 2, 3, 4])).toEqual([1, 2, 3])
  })
})

describe('toggleCompare', () => {
  it('ajoute un produit absent, à la fin', () => {
    expect(toggleCompare([1, 2], 3)).toEqual({
      ids: [1, 2, 3],
      rejected: false,
    })
  })

  it('retire un produit déjà présent', () => {
    expect(toggleCompare([1, 2, 3], 2)).toEqual({
      ids: [1, 3],
      rejected: false,
    })
  })

  it('refuse le 4e produit sans modifier la liste', () => {
    expect(toggleCompare([1, 2, 3], 4)).toEqual({
      ids: [1, 2, 3],
      rejected: true,
    })
  })

  it('renvoie une copie de la liste quand elle est pleine', () => {
    const ids = [1, 2, 3]
    const result = toggleCompare(ids, 4)
    expect(result.ids).toEqual([1, 2, 3])
    expect(result.ids).not.toBe(ids)
  })

  it('permet de retirer un produit même quand la liste est pleine', () => {
    expect(toggleCompare([1, 2, 3], 3)).toEqual({
      ids: [1, 2],
      rejected: false,
    })
  })

  it('respecte un maximum personnalisé', () => {
    expect(toggleCompare([1], 2, 1)).toEqual({ ids: [1], rejected: true })
  })

  it('ne modifie pas le tableau reçu', () => {
    const ids = [1, 2]
    toggleCompare(ids, 3)
    expect(ids).toEqual([1, 2])
  })
})
