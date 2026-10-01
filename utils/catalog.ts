import {
  PRODUCT_SUMMARY_FIELDS,
  type ProductSummary,
  type ProductsResponse,
} from '../types/dummyjson'
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

/**
 * Lit la catégorie depuis l'URL (`?category=smartphones`).
 * Elle finit dans le chemin de l'API (/products/category/<slug>) :
 * on n'accepte donc que des minuscules, chiffres et tirets.
 * Une valeur comme `../users` est refusée.
 */
export function parseCategory(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' && /^[a-z0-9-]+$/.test(raw) ? raw : ''
}

export const SORT_FIELDS = ['price', 'rating', 'title'] as const
export type SortField = (typeof SORT_FIELDS)[number]
export type SortOrder = 'asc' | 'desc'

export interface CatalogSort {
  sortBy: SortField
  order: SortOrder
}

function isSortField(value: unknown): value is SortField {
  return SORT_FIELDS.some((field) => field === value)
}

/**
 * Lit le tri depuis l'URL (`?sortBy=price&order=desc`).
 * Renvoie null sans tri valide ; l'ordre vaut `asc` par défaut.
 */
export function parseSort(
  sortByValue: unknown,
  orderValue: unknown,
): CatalogSort | null {
  const sortBy = Array.isArray(sortByValue) ? sortByValue[0] : sortByValue
  const order = Array.isArray(orderValue) ? orderValue[0] : orderValue
  if (!isSortField(sortBy)) return null
  return { sortBy, order: order === 'desc' ? 'desc' : 'asc' }
}

/** Ce que le composant de filtres renvoie quand l'utilisateur change un choix. */
export interface CatalogFiltersValue {
  category: string
  sort: CatalogSort | null
}

export interface CatalogFilters {
  page: number
  search: string
  category: string
  sort: CatalogSort | null
}

export interface CatalogQuery {
  limit: number
  skip: number
  select: string
  q?: string
  sortBy?: SortField
  order?: SortOrder
}

export interface CatalogRequest {
  path: string
  query: CatalogQuery
  /**
   * `server` : l'API filtre et pagine elle-même.
   * `client` : l'API ne sait pas combiner les filtres demandés ; on récupère
   * tous les produits candidats et on filtre + pagine nous-mêmes.
   */
  mode: 'server' | 'client'
}

/**
 * Construit la requête à envoyer à DummyJSON pour une vue du catalogue.
 *
 * - rien         → GET /products
 * - recherche    → GET /products/search?q=…
 * - catégorie    → GET /products/category/<slug>
 * - les deux     → l'API ne sait pas chercher dans une catégorie :
 *                  GET /products/search?q=…&limit=0 (tous les résultats),
 *                  puis filtre par catégorie côté client (voir paginateLocally).
 *
 * Le tri (sortBy, order) est accepté par les trois endpoints.
 */
export function buildCatalogRequest(filters: CatalogFilters): CatalogRequest {
  const sortQuery = filters.sort
    ? { sortBy: filters.sort.sortBy, order: filters.sort.order }
    : {}
  const base = {
    select: PRODUCT_SUMMARY_FIELDS.join(','),
    ...sortQuery,
  }
  const pageQuery = {
    limit: PAGE_SIZE,
    skip: pageToSkip(filters.page),
  }

  if (filters.search && filters.category) {
    return {
      path: '/products/search',
      query: { ...base, q: filters.search, limit: 0, skip: 0 },
      mode: 'client',
    }
  }
  if (filters.search) {
    return {
      path: '/products/search',
      query: { ...base, ...pageQuery, q: filters.search },
      mode: 'server',
    }
  }
  if (filters.category) {
    return {
      path: `/products/category/${filters.category}`,
      query: { ...base, ...pageQuery },
      mode: 'server',
    }
  }
  return { path: '/products', query: { ...base, ...pageQuery }, mode: 'server' }
}

/**
 * Mode `client` : à partir de tous les produits reçus, garde ceux de la
 * catégorie demandée, puis découpe la page voulue. L'ordre (déjà trié par
 * l'API) est conservé. Renvoie la même forme qu'une réponse paginée de l'API,
 * pour que la page n'ait pas à savoir quel mode a été utilisé.
 */
export function paginateLocally(
  response: ProductsResponse<ProductSummary>,
  filters: Pick<CatalogFilters, 'page' | 'category'>,
): ProductsResponse<ProductSummary> {
  const matching = filters.category
    ? response.products.filter((p) => p.category === filters.category)
    : response.products
  const skip = pageToSkip(filters.page)
  return {
    products: matching.slice(skip, skip + PAGE_SIZE),
    total: matching.length,
    skip,
    limit: PAGE_SIZE,
  }
}
