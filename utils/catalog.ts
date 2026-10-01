import { PRODUCT_SUMMARY_FIELDS } from '../types/dummyjson'
import { PAGE_SIZE, pageToSkip } from './pagination'

export interface CatalogQuery {
  limit: number
  skip: number
  select: string
}

/**
 * Construit les paramètres envoyés à GET /products pour une page du catalogue.
 * Les semaines suivantes, on y ajoutera recherche, catégorie et tri.
 */
export function buildCatalogQuery(page: number): CatalogQuery {
  return {
    limit: PAGE_SIZE,
    skip: pageToSkip(page),
    select: PRODUCT_SUMMARY_FIELDS.join(','),
  }
}
