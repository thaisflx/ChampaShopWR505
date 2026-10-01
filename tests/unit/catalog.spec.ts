import { describe, expect, it } from 'vitest'
import type { ProductSummary } from '../../types/dummyjson'
import {
  buildCatalogRequest,
  getCatalogViewState,
  paginateLocally,
  parseCategory,
  parseSearch,
  parseSort,
  type CatalogFilters,
} from '../../utils/catalog'

// Filtres par défaut : page 1, sans recherche, catégorie ni tri.
function makeFilters(overrides: Partial<CatalogFilters> = {}): CatalogFilters {
  return { page: 1, search: '', category: '', sort: null, ...overrides }
}

function makeProduct(id: number, category: string): ProductSummary {
  return {
    id,
    title: `Produit ${id}`,
    price: 10,
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
    const result = paginateLocally(response, { page: 1, category: 'laptops' })
    expect(result.total).toBe(5)
    expect(result.products.every((p) => p.category === 'laptops')).toBe(true)
  })

  it('découpe la page demandée', () => {
    const page1 = paginateLocally(response, {
      page: 1,
      category: 'smartphones',
    })
    const page2 = paginateLocally(response, {
      page: 2,
      category: 'smartphones',
    })
    expect(page1.total).toBe(15)
    expect(page1.products).toHaveLength(12)
    expect(page2.products).toHaveLength(3)
    expect(page2.skip).toBe(12)
  })

  it("conserve l'ordre reçu de l'API (déjà trié)", () => {
    const result = paginateLocally(response, { page: 1, category: 'laptops' })
    expect(result.products.map((p) => p.id)).toEqual([1, 5, 9, 13, 17])
  })
})
