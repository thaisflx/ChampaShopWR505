import { describe, expect, it } from 'vitest'
import { buildCatalogQuery, getCatalogViewState } from '../../utils/catalog'

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

describe('buildCatalogQuery', () => {
  it('demande 12 produits à partir du bon index', () => {
    const query = buildCatalogQuery(2)
    expect(query.limit).toBe(12)
    expect(query.skip).toBe(12)
  })

  it('ne demande que les champs affichés par la carte produit', () => {
    expect(buildCatalogQuery(1).select).toBe(
      'title,price,discountPercentage,rating,thumbnail',
    )
  })
})
