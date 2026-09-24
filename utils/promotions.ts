export interface CartLine {
  productId: number
  category: string
  unitPriceCents: number
  quantity: number
}

export interface AppliedDiscount {
  id: 'BEAUTY_3' | 'TROYES10'
  label: string
  amountCents: number
}

export interface CartSummary {
  grossCents: number
  discounts: AppliedDiscount[]
  shippingCents: number
  totalCents: number
  messages: string[] // ex. : pourquoi un code est refusé
}

const FREE_SHIPPING_THRESHOLD_CENTS = 8000
const SHIPPING_COST_CENTS = 490
const MAX_DISCOUNT_RATIO = 0.25

/**
 * Arrondi commercial (demi vers le haut), en centimes.
 */
function roundCents(value: number): number {
  return Math.round(value)
}

export function computeCart(lines: CartLine[], promoCode?: string): CartSummary {
  const messages: string[] = []
  const grossCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0)
  const discounts: AppliedDiscount[] = []

  // TODO 1 — Remise beauté : si quantité cumulée de catégorie "beauty" >= 3,
  // -10% sur chaque ligne beauty, arrondie ligne par ligne (roundCents).

  // TODO 2 — Code TROYES10 : -10,00€ si le sous-total après remise beauté
  // est strictement > 50,00€. Normaliser le code (trim + toLowerCase) avant comparaison.
  // Si refusé, ajouter un message explicite dans `messages`.

  // TODO 3 — Plafond : le total des remises ne doit jamais dépasser 25% du
  // sous-total brut. Si dépassement, réduire le montant du code promo (pas la remise beauté).

  // TODO 4 — Livraison : 4,90€, offerte si (grossCents - total des remises) >= 8000,
  // sauf si le panier contient un produit "furniture".

  const totalDiscountCents = discounts.reduce((sum, d) => sum + d.amountCents, 0)
  const shippingCents = SHIPPING_COST_CENTS // TODO: appliquer la règle de gratuité
  const totalCents = grossCents - totalDiscountCents + shippingCents

  return {
    grossCents,
    discounts,
    shippingCents,
    totalCents,
    messages
  }
}
