// Logique de la page /comparer : fonctions pures, sans Vue ni Nuxt,
// testables avec Vitest. Le tableau et la page ne font qu'afficher le résultat.

import type { ComparedProduct } from '../types/dummyjson'
import { formatDiscount, formatPrice, formatRating } from './format'

// ---------------------------------------------------------------------------
// URL et sélection
// ---------------------------------------------------------------------------

/**
 * L'URL doit-elle être réécrite ? Oui si la valeur brute de `?ids=` n'est pas
 * exactement la liste propre (`"3,17"`). Exemples qui déclenchent une
 * normalisation : `"3,abc,17"`, `"3,3"`, `"1,2,3,4"`, `?ids=3&ids=17`.
 */
export function needsNormalization(rawIds: unknown, ids: number[]): boolean {
  const canonical = ids.join(',')
  if (rawIds === undefined || rawIds === null) return canonical !== ''
  return rawIds !== canonical
}

/** Deux sélections contiennent-elles les mêmes produits (ordre ignoré) ? */
export function isSameSelection(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((id) => b.includes(id))
}

// ---------------------------------------------------------------------------
// Chargement
// ---------------------------------------------------------------------------

export type ProductLoadResult =
  | { id: number; status: 'ok'; product: ComparedProduct }
  | { id: number; status: 'not-found' }
  | { id: number; status: 'error' }

/**
 * Classe l'erreur d'un appel à l'API.
 * - 404 → le produit n'existe pas : on le retire de l'URL.
 * - autre chose (réseau, 500…) → échec temporaire : on garde l'identifiant
 *   et on propose de réessayer.
 * L'erreur est `unknown` : on vérifie sa forme avant de lire le code HTTP.
 */
export function classifyLoadError(error: unknown): 'not-found' | 'error' {
  if (typeof error === 'object' && error !== null) {
    const status =
      'statusCode' in error
        ? error.statusCode
        : 'status' in error
          ? error.status
          : undefined
    if (status === 404) return 'not-found'
  }
  return 'error'
}

// ---------------------------------------------------------------------------
// Tableau comparatif
// ---------------------------------------------------------------------------

export type ComparisonRowKey =
  | 'price'
  | 'discount'
  | 'rating'
  | 'availability'
  | 'brand'
  | 'category'
  | 'weight'
  | 'dimensions'
  | 'warranty'
  | 'shipping'

export interface ComparisonRow {
  key: ComparisonRowKey
  label: string
  /** Une valeur affichée par produit, dans l'ordre des colonnes. */
  values: string[]
  /** best[i] vaut true si le produit i a la meilleure valeur de la ligne. */
  best: boolean[]
  /** Texte affiché à côté de la meilleure valeur (« Meilleur prix »). */
  bestLabel: string | null
}

const AVAILABILITY_LABELS: Record<string, string> = {
  'In Stock': 'En stock',
  'Low Stock': 'Stock faible',
  'Out of Stock': 'Rupture de stock',
}

const numberFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
})

function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** "In Stock" + 12 → "En stock (12 en stock)" */
export function formatAvailability(status: string, stock: number): string {
  const label = AVAILABILITY_LABELS[status] ?? status
  return `${label} (${stock} en stock)`
}

/**
 * Indices des meilleures valeurs ('min' ou 'max'). Les ex æquo sont tous
 * marqués. Si toutes les valeurs sont égales, ou s'il y a moins de deux
 * produits, personne n'est mis en avant : il n'y a rien à départager.
 */
export function findBest(
  values: number[],
  direction: 'min' | 'max',
): boolean[] {
  const allEqual = values.every((value) => value === values[0])
  if (values.length < 2 || allEqual) return values.map(() => false)
  const target = direction === 'min' ? Math.min(...values) : Math.max(...values)
  return values.map((value) => value === target)
}

function row(
  key: ComparisonRowKey,
  label: string,
  values: string[],
  best: boolean[] = values.map(() => false),
  bestLabel: string | null = null,
): ComparisonRow {
  return { key, label, values, best, bestLabel }
}

/**
 * Construit les lignes du tableau (hors image : c'est un visuel, géré par le
 * composant ; le titre est dans l'en-tête de chaque colonne).
 * Lignes comparables : prix (le plus bas), note (la plus haute),
 * disponibilité (le stock le plus élevé).
 */
export function buildComparisonRows(
  products: ComparedProduct[],
): ComparisonRow[] {
  const map = <T>(fn: (product: ComparedProduct) => T): T[] => products.map(fn)

  return [
    row(
      'price',
      'Prix',
      map((p) => formatPrice(p.price)),
      findBest(
        map((p) => p.price),
        'min',
      ),
      'Meilleur prix',
    ),
    row(
      'discount',
      'Remise',
      map((p) => formatDiscount(p.discountPercentage) ?? 'Aucune'),
    ),
    row(
      'rating',
      'Note',
      map((p) => `${formatRating(p.rating)} / 5`),
      findBest(
        map((p) => p.rating),
        'max',
      ),
      'Meilleure note',
    ),
    row(
      'availability',
      'Disponibilité',
      map((p) => formatAvailability(p.availabilityStatus, p.stock)),
      findBest(
        map((p) => p.stock),
        'max',
      ),
      'Stock le plus élevé',
    ),
    row(
      'brand',
      'Marque',
      map((p) => p.brand ?? 'Non renseignée'),
    ),
    row(
      'category',
      'Catégorie',
      map((p) => p.category),
    ),
    row(
      'weight',
      'Poids',
      map((p) => formatNumber(p.weight)),
    ),
    row(
      'dimensions',
      'Dimensions (l × h × p)',
      map(
        (p) =>
          `${formatNumber(p.dimensions.width)} × ${formatNumber(p.dimensions.height)} × ${formatNumber(p.dimensions.depth)}`,
      ),
    ),
    row(
      'warranty',
      'Garantie',
      map((p) => p.warrantyInformation),
    ),
    row(
      'shipping',
      'Livraison',
      map((p) => p.shippingInformation),
    ),
  ]
}

/** Une ligne est identique si tous les produits affichent la même valeur. */
export function isIdenticalRow(row: ComparisonRow): boolean {
  return row.values.every((value) => value === row.values[0])
}

/** « Afficher uniquement les différences » : masque les lignes identiques. */
export function onlyDifferences(rows: ComparisonRow[]): ComparisonRow[] {
  return rows.filter((row) => !isIdenticalRow(row))
}
