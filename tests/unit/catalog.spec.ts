import { describe, expect, it } from 'vitest'
import {
  buildCatalogRequest,
  getCatalogViewState,
  parseSearch,
} from '../../utils/catalog'

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

describe('buildCatalogRequest', () => {
  it('sans recherche, interroge /products', () => {
    const request = buildCatalogRequest({ page: 2, search: '' })
    expect(request.path).toBe('/products')
    expect(request.query.limit).toBe(12)
    expect(request.query.skip).toBe(12)
    expect(request.query.q).toBeUndefined()
  })

  it('avec une recherche, interroge /products/search avec q', () => {
    const request = buildCatalogRequest({ page: 1, search: 'phone' })
    expect(request.path).toBe('/products/search')
    expect(request.query.q).toBe('phone')
    expect(request.query.skip).toBe(0)
  })

  it('pagine aussi les résultats de recherche', () => {
    expect(buildCatalogRequest({ page: 3, search: 'phone' }).query.skip).toBe(
      24,
    )
  })

  it('ne demande que les champs affichés par la carte produit', () => {
    expect(buildCatalogRequest({ page: 1, search: '' }).query.select).toBe(
      'title,price,discountPercentage,rating,thumbnail',
    )
  })
})
