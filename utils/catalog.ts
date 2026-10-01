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

/**
 * Lit le texte recherché depuis l'URL (`?q=mascara`).
 * Renvoie une chaîne vide si absent ou invalide ; les espaces autour sont retirés.
 */
export function parseSearch(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw.trim() : ''
}

export interface CatalogFilters {
  page: number
  search: string
}

export interface CatalogQuery {
  limit: number
  skip: number
  select: string
  q?: string
}

export interface CatalogRequest {
  path: '/products' | '/products/search'
  query: CatalogQuery
}

/**
 * Construit la requête à envoyer à DummyJSON pour une vue du catalogue.
 * Avec une recherche, on utilise GET /products/search?q=… ;
 * sans recherche, GET /products. La pagination fonctionne pareil sur les deux.
 */
export function buildCatalogRequest(filters: CatalogFilters): CatalogRequest {
  const query: CatalogQuery = {
    limit: PAGE_SIZE,
    skip: pageToSkip(filters.page),
    select: PRODUCT_SUMMARY_FIELDS.join(','),
  }

  if (filters.search) {
    return { path: '/products/search', query: { ...query, q: filters.search } }
  }
  return { path: '/products', query }
}
