import { describe, expect, it } from 'vitest'
import type { ComparedProduct } from '../../types/dummyjson'
import {
  buildComparisonRows,
  classifyLoadError,
  findBest,
  formatAvailability,
  isIdenticalRow,
  isSameSelection,
  needsNormalization,
  onlyDifferences,
  type ComparisonRow,
} from '../../utils/comparison'

function makeProduct(
  overrides: Partial<ComparedProduct> = {},
): ComparedProduct {
  return {
    id: 1,
    title: 'Produit',
    thumbnail: '',
    price: 100,
    discountPercentage: 10,
    rating: 4,
    availabilityStatus: 'In Stock',
    stock: 20,
    brand: 'Marque',
    category: 'smartphones',
    weight: 2,
    dimensions: { width: 10, height: 20, depth: 5 },
    warrantyInformation: '1 year warranty',
    shippingInformation: 'Ships in 1 week',
    ...overrides,
  }
}

// Normalise les espaces insécables qu'Intl met dans les nombres et les prix.
const normalizeSpaces = (text: string): string => text.replace(/\s/g, ' ')

function rowOf(
  rows: ComparisonRow[],
  key: ComparisonRow['key'],
): ComparisonRow {
  const found = rows.find((r) => r.key === key)
  if (!found) throw new Error(`Ligne ${key} absente`)
  return found
}

describe('needsNormalization', () => {
  it('ne réécrit pas une URL déjà propre', () => {
    expect(needsNormalization('3,17', [3, 17])).toBe(false)
  })

  it('ne réécrit pas une page sans paramètre ids', () => {
    expect(needsNormalization(undefined, [])).toBe(false)
  })

  it('réécrit si des identifiants ont été ignorés ou dédoublonnés', () => {
    expect(needsNormalization('3,abc,17', [3, 17])).toBe(true)
    expect(needsNormalization('3,3', [3])).toBe(true)
    expect(needsNormalization('1,2,3,4', [1, 2, 3])).toBe(true)
    expect(needsNormalization('abc', [])).toBe(true)
  })

  it('réécrit un paramètre répété (?ids=3&ids=17)', () => {
    expect(needsNormalization(['3', '17'], [3, 17])).toBe(true)
  })
})

describe('isSameSelection', () => {
  it("ignore l'ordre", () => {
    expect(isSameSelection([3, 17], [17, 3])).toBe(true)
  })

  it('détecte une sélection différente', () => {
    expect(isSameSelection([3, 17], [3, 42])).toBe(false)
    expect(isSameSelection([3], [3, 17])).toBe(false)
  })

  it('deux sélections vides sont identiques', () => {
    expect(isSameSelection([], [])).toBe(true)
  })
})

describe('classifyLoadError', () => {
  it('reconnaît un produit inexistant (404)', () => {
    expect(classifyLoadError({ statusCode: 404 })).toBe('not-found')
    expect(classifyLoadError({ status: 404 })).toBe('not-found')
  })

  it('traite le reste comme un échec temporaire', () => {
    expect(classifyLoadError({ statusCode: 500 })).toBe('error')
    expect(classifyLoadError(new TypeError('Failed to fetch'))).toBe('error')
    expect(classifyLoadError(null)).toBe('error')
    expect(classifyLoadError('oups')).toBe('error')
  })
})

describe('findBest', () => {
  it('trouve le plus bas', () => {
    expect(findBest([30, 10, 20], 'min')).toEqual([false, true, false])
  })

  it('trouve le plus haut', () => {
    expect(findBest([3, 4.5, 4], 'max')).toEqual([false, true, false])
  })

  it('marque tous les ex æquo', () => {
    expect(findBest([10, 10, 20], 'min')).toEqual([true, true, false])
  })

  it('ne met personne en avant si tout est égal', () => {
    expect(findBest([10, 10, 10], 'min')).toEqual([false, false, false])
  })

  it('ne met personne en avant avec un seul produit', () => {
    expect(findBest([10], 'min')).toEqual([false])
  })
})

describe('formatAvailability', () => {
  it('traduit le statut et ajoute le stock', () => {
    expect(formatAvailability('In Stock', 12)).toBe('En stock (12 en stock)')
    expect(formatAvailability('Low Stock', 3)).toBe('Stock faible (3 en stock)')
    expect(formatAvailability('Out of Stock', 0)).toBe(
      'Rupture de stock (0 en stock)',
    )
  })

  it('garde un statut inconnu tel quel', () => {
    expect(formatAvailability('Preorder', 5)).toBe('Preorder (5 en stock)')
  })
})

describe('buildComparisonRows', () => {
  const cheap = makeProduct({ id: 1, price: 50, rating: 3, stock: 5 })
  const topRated = makeProduct({ id: 2, price: 80, rating: 4.8, stock: 40 })
  const rows = buildComparisonRows([cheap, topRated])

  it('contient toutes les lignes demandées, dans l’ordre', () => {
    expect(rows.map((r) => r.key)).toEqual([
      'price',
      'discount',
      'rating',
      'availability',
      'brand',
      'category',
      'weight',
      'dimensions',
      'warranty',
      'shipping',
    ])
  })

  it('une valeur par produit, dans l’ordre des colonnes', () => {
    expect(rows.every((r) => r.values.length === 2)).toBe(true)
  })

  it('met en avant le prix le plus bas avec un libellé texte', () => {
    const price = rowOf(rows, 'price')
    expect(price.best).toEqual([true, false])
    expect(price.bestLabel).toBe('Meilleur prix')
  })

  it('met en avant la note la plus haute', () => {
    expect(rowOf(rows, 'rating').best).toEqual([false, true])
  })

  it('met en avant le stock le plus élevé', () => {
    const availability = rowOf(rows, 'availability')
    expect(availability.best).toEqual([false, true])
    expect(availability.bestLabel).toBe('Stock le plus élevé')
  })

  it('ne met rien en avant sur les lignes non comparables', () => {
    expect(rowOf(rows, 'brand').best).toEqual([false, false])
    expect(rowOf(rows, 'brand').bestLabel).toBeNull()
  })

  it('formate les dimensions en l × h × p', () => {
    expect(normalizeSpaces(rowOf(rows, 'dimensions').values[0] ?? '')).toBe(
      '10 × 20 × 5',
    )
  })

  it('gère une marque absente et une remise nulle', () => {
    const noBrand = makeProduct({ brand: undefined, discountPercentage: 0 })
    const result = buildComparisonRows([noBrand])
    expect(rowOf(result, 'brand').values).toEqual(['Non renseignée'])
    expect(rowOf(result, 'discount').values).toEqual(['Aucune'])
  })

  it('renvoie des lignes vides pour une liste vide', () => {
    expect(buildComparisonRows([]).every((r) => r.values.length === 0)).toBe(
      true,
    )
  })
})

describe('onlyDifferences', () => {
  const a = makeProduct({ id: 1, price: 50 })
  const b = makeProduct({ id: 2, price: 80 })
  const rows = buildComparisonRows([a, b])

  it('détecte une ligne identique', () => {
    expect(isIdenticalRow(rowOf(rows, 'category'))).toBe(true)
    expect(isIdenticalRow(rowOf(rows, 'price'))).toBe(false)
  })

  it('ne garde que les lignes qui diffèrent', () => {
    expect(onlyDifferences(rows).map((r) => r.key)).toEqual(['price'])
  })
})
