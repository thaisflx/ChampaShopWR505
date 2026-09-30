import { describe, expect, it } from 'vitest'
import { buildCatalogQuery } from '../../utils/catalog'

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
