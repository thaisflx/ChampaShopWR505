// Fonctions pures de pagination : aucune dépendance à Vue ou Nuxt,
// donc testables directement avec Vitest.

export const PAGE_SIZE = 12

/**
 * Lit le numéro de page depuis la query string (`?page=3`).
 * Toute valeur invalide (absente, "abc", "0", "-2", "1.5") donne la page 1.
 */
export function parsePage(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number(raw)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

/** Convertit un numéro de page (commence à 1) en `skip` pour l'API. */
export function pageToSkip(page: number, pageSize: number = PAGE_SIZE): number {
  return (page - 1) * pageSize
}

/** Nombre total de pages ; au moins 1, même sans résultat. */
export function countPages(
  total: number,
  pageSize: number = PAGE_SIZE,
): number {
  return Math.max(1, Math.ceil(total / pageSize))
}
