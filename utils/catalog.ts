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

export interface PriceRange {
  min: number | null
  max: number | null
}

function parsePrice(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const price = Number(raw)
  return Number.isFinite(price) && price >= 0 ? price : null
}

/**
 * Lit la fourchette de prix depuis l'URL (`?minPrice=50&maxPrice=200`).
 * Une borne absente ou invalide vaut null (pas de limite).
 * Si min > max, on les inverse : l'intention de l'utilisateur est claire.
 */
export function parsePriceRange(
  minValue: unknown,
  maxValue: unknown,
): PriceRange {
  const min = parsePrice(minValue)
  const max = parsePrice(maxValue)
  if (min !== null && max !== null && min > max) return { min: max, max: min }
  return { min, max }
}

export function hasPriceFilter(price: PriceRange): boolean {
  return price.min !== null || price.max !== null
}

/** Ce que le composant de filtres renvoie quand l'utilisateur change un choix. */
export interface CatalogFiltersValue {
  category: string
  sort: CatalogSort | null
  price: PriceRange
}

export interface CatalogFilters {
  page: number
  search: string
  category: string
  sort: CatalogSort | null
  price: PriceRange
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
   * `client` : l'API ne sait pas appliquer tous les filtres demandés ;
   * on récupère tous les produits candidats, puis on filtre et pagine nous-mêmes.
   */
  mode: 'server' | 'client'
}

/**
 * Construit la requête à envoyer à DummyJSON pour une vue du catalogue.
 *
 * L'endpoint dépend des filtres que l'API sait appliquer :
 * - recherche  → GET /products/search?q=…
 * - catégorie  → GET /products/category/<slug>
 * - sinon      → GET /products
 * Le tri (sortBy, order) est accepté par les trois.
 *
 * Mode `client` quand l'API ne peut pas tout faire :
 * - recherche + catégorie (pas d'endpoint qui combine les deux),
 * - fourchette de prix (aucun filtre prix dans l'API).
 * On demande alors tous les résultats (`limit=0`), déjà triés,
 * et `paginateLocally` termine le travail. Justification dans le README.
 */
export function buildCatalogRequest(filters: CatalogFilters): CatalogRequest {
  const sortQuery = filters.sort
    ? { sortBy: filters.sort.sortBy, order: filters.sort.order }
    : {}
  const searchQuery = filters.search ? { q: filters.search } : {}

  let path = '/products'
  if (filters.search) path = '/products/search'
  else if (filters.category) path = `/products/category/${filters.category}`

  const needsClient =
    (filters.search !== '' && filters.category !== '') ||
    hasPriceFilter(filters.price)

  return {
    path,
    query: {
      select: PRODUCT_SUMMARY_FIELDS.join(','),
      ...sortQuery,
      ...searchQuery,
      limit: needsClient ? 0 : PAGE_SIZE,
      skip: needsClient ? 0 : pageToSkip(filters.page),
    },
    mode: needsClient ? 'client' : 'server',
  }
}

/** Le produit respecte-t-il la catégorie et la fourchette de prix ? */
export function matchesClientFilters(
  product: ProductSummary,
  filters: Pick<CatalogFilters, 'category' | 'price'>,
): boolean {
  if (filters.category && product.category !== filters.category) return false
  if (filters.price.min !== null && product.price < filters.price.min) {
    return false
  }
  if (filters.price.max !== null && product.price > filters.price.max) {
    return false
  }
  return true
}

/**
 * Mode `client` : à partir de tous les produits reçus, garde ceux qui
 * respectent la catégorie et le prix, puis découpe la page voulue.
 * L'ordre (déjà trié par l'API) est conservé. Renvoie la même forme qu'une
 * réponse paginée de l'API : la page n'a pas à savoir quel mode a été utilisé.
 */
export function paginateLocally(
  response: ProductsResponse<ProductSummary>,
  filters: Pick<CatalogFilters, 'page' | 'category' | 'price'>,
): ProductsResponse<ProductSummary> {
  const matching = response.products.filter((product) =>
    matchesClientFilters(product, filters),
  )
  const skip = pageToSkip(filters.page)
  return {
    products: matching.slice(skip, skip + PAGE_SIZE),
    total: matching.length,
    skip,
    limit: PAGE_SIZE,
  }
}
