// Logique de la fiche produit : fonctions pures, testables avec Vitest.

export const LOW_STOCK_THRESHOLD = 5

export interface StockStatus {
  label: string
  canAddToCart: boolean
  isLow: boolean
}

/**
 * 0 → « Rupture de stock », bouton désactivé.
 * Moins de 5 → « Plus que X en stock ».
 * Sinon → « En stock ».
 */
export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) {
    return { label: 'Rupture de stock', canAddToCart: false, isLow: false }
  }
  if (stock < LOW_STOCK_THRESHOLD) {
    return {
      label: `Plus que ${stock} en stock`,
      canAddToCart: true,
      isLow: true,
    }
  }
  return { label: 'En stock', canAddToCart: true, isLow: false }
}

/**
 * Lit l'identifiant dans l'URL (`/produits/12`).
 * Renvoie null si ce n'est pas un entier positif (`/produits/abc`).
 */
export function parseProductId(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)
  return Number.isInteger(id) && id >= 1 ? id : null
}
