// Formatage d'affichage, en français. Fonctions pures.

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

/** 9.99 → "9,99 €" */
export function formatPrice(price: number): string {
  return priceFormatter.format(price)
}

/**
 * 10.48 → "−10 %" (arrondi à l'entier).
 * Renvoie null si la remise arrondie est nulle : pas de badge à afficher.
 */
export function formatDiscount(discountPercentage: number): string | null {
  const rounded = Math.round(discountPercentage)
  return rounded > 0 ? `−${rounded} %` : null
}

/** 2.56 → "2,6" */
export function formatRating(rating: number): string {
  return rating.toLocaleString('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}
