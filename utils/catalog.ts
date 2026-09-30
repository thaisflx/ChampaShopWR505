import { PRODUCT_SUMMARY_FIELDS } from '../types/dummyjson'
import { PAGE_SIZE, pageToSkip } from './pagination'

// Mêmes valeurs que le `status` renvoyé par useFetch.
export type FetchStatus = 'idle' | 'pending' | 'success' | 'error'

// Ce que la page catalogue doit afficher.
export type CatalogViewState = 'loading' | 'error' | 'empty' | 'ready'

/**
 * Décide quel état afficher à partir du statut de la requête
 * et du nombre de produits reçus.
 */
export function getCatalogViewState(
  status: FetchStatus,
  productCount: number,
): CatalogViewState {
  if (status === 'idle' || status === 'pending') return 'loading'
  if (status === 'error') return 'error'
  return productCount === 0 ? 'empty' : 'ready'
}

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
