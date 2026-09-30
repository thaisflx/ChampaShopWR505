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
  messages: string[]
}

const SHIPPING_COST_CENTS = 490
const FREE_SHIPPING_THRESHOLD_CENTS = 8000
const TROYES10_DISCOUNT_CENTS = 1000
const TROYES10_MIN_SUBTOTAL_CENTS = 5000
const MAX_DISCOUNT_RATIO = 0.25

function roundCents(value: number): number {
  return Math.round(value)
}

export function computeCart(lines: CartLine[], promoCode?: string): CartSummary {
  const messages: string[] = []
  const grossCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0)

  //Règle 1 REMISE BEAUTÉ
  const beautyQtyTotal = lines
    .filter((line) => line.category === 'beauty')
    .reduce((sum, line) => sum + line.quantity, 0)

  let beautyDiscountCents = 0
  if (beautyQtyTotal >= 3) {
    for (const line of lines) {
      if (line.category === 'beauty') {
        const lineTotalCents = line.unitPriceCents * line.quantity
        beautyDiscountCents += roundCents(lineTotalCents * 0.1)
      }
    }
  }

  const subtotalAfterBeautyCents = grossCents - beautyDiscountCents

  //Règle 2 CODE TROYES10
  let codeDiscountCents = 0
  if (promoCode) {
    const normalizedCode = promoCode.trim().toLowerCase()
    if (normalizedCode === 'troyes10') {
      if (subtotalAfterBeautyCents > TROYES10_MIN_SUBTOTAL_CENTS) {
        codeDiscountCents = TROYES10_DISCOUNT_CENTS
      } else {
        messages.push(
          'Code TROYES10 refusé : le sous-total après remise doit dépasser 50,00€'
        )
      }
    } else {
      messages.push(`Code promo "${promoCode}" inconnu`)
    }
  }

  //Règle 3 PLAFOND À 25%
  const maxDiscountCents = roundCents(grossCents * MAX_DISCOUNT_RATIO)
  const totalDiscountBeforeCapCents = beautyDiscountCents + codeDiscountCents
  if (totalDiscountBeforeCapCents > maxDiscountCents) {
    codeDiscountCents = Math.max(0, maxDiscountCents - beautyDiscountCents)
  }

  const discounts: AppliedDiscount[] = []
  if (beautyDiscountCents > 0) {
    discounts.push({
      id: 'BEAUTY_3',
      label: 'Remise beauté -10% (3 articles ou plus)',
      amountCents: beautyDiscountCents
    })
  }
  if (codeDiscountCents > 0) {
    discounts.push({
      id: 'TROYES10',
      label: 'Code TROYES10',
      amountCents: codeDiscountCents
    })
  }

  const totalDiscountCents = beautyDiscountCents + codeDiscountCents
  const amountAfterDiscountsCents = grossCents - totalDiscountCents

  //Règle 4 LIVRAISON
  const hasFurniture = lines.some((line) => line.category === 'furniture')
  const shippingCents =
    amountAfterDiscountsCents >= FREE_SHIPPING_THRESHOLD_CENTS && !hasFurniture
      ? 0
      : SHIPPING_COST_CENTS

  const totalCents = amountAfterDiscountsCents + shippingCents

  return {
    grossCents,
    discounts,
    shippingCents,
    totalCents,
    messages
  }
}