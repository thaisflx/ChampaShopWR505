import { describe, expect, it } from 'vitest'
import type { ProductSummary } from '../../types/dummyjson'
import {
  buildCatalogRequest,
  getCatalogViewState,
  matchesClientFilters,
  paginateLocally,
  parseCategory,
  parsePriceRange,
  parseSearch,
  parseSort,
  type CatalogFilters,
} from '../../utils/catalog'

// Filtres par défaut : page 1, sans recherche, catégorie ni tri.
function makeFilters(overrides: Partial<CatalogFilters> = {}): CatalogFilters {
  return {
    page: 1,
    search: '',
    category: '',
    sort: null,
    price: { min: null, max: null },
    ...overrides,
  }
}

const NO_PRICE = { min: null, max: null }

function makeProduct(id: number, category: string, price = 10): ProductSummary {
  return {
    id,
    title: `Produit ${id}`,
    price,
    discountPercentage: 0,
    rating: 4,
    thumbnail: '',
    category,
  }
}

describe('getCatalogViewState', () => {
  it('affiche le chargement tant que la requête est en cours', () => {
    expect(getCatalogViewState('pending', 0)).toBe('loading')
    expect(getCatalogViewState('idle', 0)).toBe('loading')
  })

  it("affiche le chargement même s'il reste des produits de la page précédente", () => {
    expect(getCatalogViewState('pending', 12)).toBe('loading')
  })

  it("affiche l'erreur quand la requête a échoué", () => {
    expect(getCatalogViewState('error', 0)).toBe('error')
  })

  it("affiche l'état vide quand la requête réussit sans produit", () => {
    expect(getCatalogViewState('success', 0)).toBe('empty')
  })

  it('affiche les produits quand il y en a', () => {
    expect(getCatalogViewState('success', 12)).toBe('ready')
  })
})

describe('parseSearch', () => {
  it('lit le texte recherché en retirant les espaces autour', () => {
    expect(parseSearch('  mascara ')).toBe('mascara')
  })

  it('renvoie une chaîne vide si le paramètre est absent', () => {
    expect(parseSearch(undefined)).toBe('')
    expect(parseSearch(null)).toBe('')
  })

  it('prend la première valeur si le paramètre est répété', () => {
    expect(parseSearch(['phone', 'laptop'])).toBe('phone')
  })
})

describe('parseCategory', () => {
  it('accepte un slug valide', () => {
    expect(parseCategory('smartphones')).toBe('smartphones')
    expect(parseCategory('home-decoration')).toBe('home-decoration')
  })

  it("refuse ce qui pourrait détourner le chemin de l'API", () => {
    expect(parseCategory('../users')).toBe('')
    expect(parseCategory('a/b')).toBe('')
    expect(parseCategory('Smartphones')).toBe('')
  })

  it('renvoie une chaîne vide si le paramètre est absent', () => {
    expect(parseCategory(undefined)).toBe('')
  })
})

describe('parseSort', () => {
  it('lit un tri valide', () => {
    expect(parseSort('price', 'desc')).toEqual({
      sortBy: 'price',
      order: 'desc',
    })
  })

  it("utilise l'ordre croissant par défaut", () => {
    expect(parseSort('title', undefined)).toEqual({
      sortBy: 'title',
      order: 'asc',
    })
    expect(parseSort('rating', 'nimporte')).toEqual({
      sortBy: 'rating',
      order: 'asc',
    })
  })

  it('renvoie null pour un champ de tri non autorisé', () => {
    expect(parseSort('stock', 'asc')).toBeNull()
    expect(parseSort(undefined, undefined)).toBeNull()
  })
})

describe('parsePriceRange', () => {
  it('lit les deux bornes', () => {
    expect(parsePriceRange('50', '200')).toEqual({ min: 50, max: 200 })
  })

  it('accepte une seule borne et des décimales', () => {
    expect(parsePriceRange('9.99', undefined)).toEqual({ min: 9.99, max: null })
    expect(parsePriceRange(undefined, '100')).toEqual({ min: null, max: 100 })
  })

  it('ignore les valeurs vides, négatives ou invalides', () => {
    expect(parsePriceRange('', 'abc')).toEqual({ min: null, max: null })
    expect(parsePriceRange('-5', undefined)).toEqual({ min: null, max: null })
  })

  it('inverse les bornes si min est plus grand que max', () => {
    expect(parsePriceRange('200', '50')).toEqual({ min: 50, max: 200 })
  })
})

describe('buildCatalogRequest', () => {
  it('sans filtre, interroge /products avec pagination serveur', () => {
    const request = buildCatalogRequest(makeFilters({ page: 2 }))
    expect(request.path).toBe('/products')
    expect(request.mode).toBe('server')
    expect(request.query.limit).toBe(12)
    expect(request.query.skip).toBe(12)
    expect(request.query.q).toBeUndefined()
  })

  it('avec une recherche, interroge /products/search avec q', () => {
    const request = buildCatalogRequest(makeFilters({ search: 'phone' }))
    expect(request.path).toBe('/products/search')
    expect(request.query.q).toBe('phone')
    expect(request.mode).toBe('server')
  })

  it('avec une catégorie, interroge /products/category/<slug>', () => {
    const request = buildCatalogRequest(
      makeFilters({ category: 'smartphones', page: 3 }),
    )
    expect(request.path).toBe('/products/category/smartphones')
    expect(request.query.skip).toBe(24)
    expect(request.mode).toBe('server')
  })

  it('recherche + catégorie : récupère tous les résultats et passe en mode client', () => {
    const request = buildCatalogRequest(
      makeFilters({ search: 'phone', category: 'smartphones', page: 2 }),
    )
    expect(request.path).toBe('/products/search')
    expect(request.query.q).toBe('phone')
    expect(request.query.limit).toBe(0)
    expect(request.mode).toBe('client')
  })

  it("transmet le tri à l'API", () => {
    const request = buildCatalogRequest(
      makeFilters({ sort: { sortBy: 'price', order: 'desc' } }),
    )
    expect(request.query.sortBy).toBe('price')
    expect(request.query.order).toBe('desc')
  })

  it("n'ajoute pas de tri quand il n'y en a pas", () => {
    const request = buildCatalogRequest(makeFilters())
    expect(request.query).not.toHaveProperty('sortBy')
    expect(request.query).not.toHaveProperty('order')
  })

  it('avec un filtre prix, passe en mode client sur /products', () => {
    const request = buildCatalogRequest(
      makeFilters({ price: { min: 50, max: null }, page: 3 }),
    )
    expect(request.path).toBe('/products')
    expect(request.mode).toBe('client')
    expect(request.query.limit).toBe(0)
    expect(request.query.skip).toBe(0)
  })

  it('catégorie + prix : un seul appel à la catégorie, filtre prix côté client', () => {
    const request = buildCatalogRequest(
      makeFilters({ category: 'laptops', price: { min: null, max: 1500 } }),
    )
    expect(request.path).toBe('/products/category/laptops')
    expect(request.mode).toBe('client')
  })

  it('ne demande que les champs utiles au catalogue', () => {
    expect(buildCatalogRequest(makeFilters()).query.select).toBe(
      'title,price,discountPercentage,rating,thumbnail,category',
    )
  })
})

describe('paginateLocally', () => {
  // 15 smartphones et 5 laptops, mélangés.
  const products = Array.from({ length: 20 }, (_, i) =>
    makeProduct(i + 1, i % 4 === 0 ? 'laptops' : 'smartphones'),
  )
  const response = { products, total: 20, skip: 0, limit: 0 }

  it('garde seulement la catégorie demandée et recalcule le total', () => {
    const result = paginateLocally(response, {
      page: 1,
      category: 'laptops',
      price: NO_PRICE,
    })
    expect(result.total).toBe(5)
    expect(result.products.every((p) => p.category === 'laptops')).toBe(true)
  })

  it('découpe la page demandée', () => {
    const page1 = paginateLocally(response, {
      page: 1,
      category: 'smartphones',
      price: NO_PRICE,
    })
    const page2 = paginateLocally(response, {
      page: 2,
      category: 'smartphones',
      price: NO_PRICE,
    })
    expect(page1.total).toBe(15)
    expect(page1.products).toHaveLength(12)
    expect(page2.products).toHaveLength(3)
    expect(page2.skip).toBe(12)
  })

  it("conserve l'ordre reçu de l'API (déjà trié)", () => {
    const result = paginateLocally(response, {
      page: 1,
      category: 'laptops',
      price: NO_PRICE,
    })
    expect(result.products.map((p) => p.id)).toEqual([1, 5, 9, 13, 17])
  })
})

describe('matchesClientFilters', () => {
  const laptop = makeProduct(1, 'laptops', 1000)

  it('accepte un produit dans la fourchette, bornes incluses', () => {
    expect(
      matchesClientFilters(laptop, {
        category: '',
        price: { min: 1000, max: 1000 },
      }),
    ).toBe(true)
  })

  it('refuse un produit hors fourchette', () => {
    expect(
      matchesClientFilters(laptop, {
        category: '',
        price: { min: 1001, max: null },
      }),
    ).toBe(false)
    expect(
      matchesClientFilters(laptop, {
        category: '',
        price: { min: null, max: 999 },
      }),
    ).toBe(false)
  })

  it('refuse un produit d’une autre catégorie', () => {
    expect(
      matchesClientFilters(laptop, {
        category: 'smartphones',
        price: NO_PRICE,
      }),
    ).toBe(false)
  })
})

describe('paginateLocally avec un filtre prix', () => {
  // Prix de 10 € à 200 € (10, 20, …, 200).
  const products = Array.from({ length: 20 }, (_, i) =>
    makeProduct(i + 1, 'laptops', (i + 1) * 10),
  )
  const response = { products, total: 20, skip: 0, limit: 0 }

  it('garde les produits dans la fourchette et recalcule le total', () => {
    const result = paginateLocally(response, {
      page: 1,
      category: '',
      price: { min: 50, max: 100 },
    })
    expect(result.total).toBe(6)
    expect(result.products.map((p) => p.price)).toEqual([
      50, 60, 70, 80, 90, 100,
    ])
  })

  it('pagine le résultat filtré, pas la liste complète', () => {
    const page2 = paginateLocally(response, {
      page: 2,
      category: '',
      price: { min: 30, max: null },
    })
    // 18 produits de 30 € à 200 € : la page 2 en contient 6.
    expect(page2.total).toBe(18)
    expect(page2.products).toHaveLength(6)
    expect(page2.products[0]?.price).toBe(150)
  })
})
