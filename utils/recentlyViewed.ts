// Historique « Vus récemment » : fonctions pures, testables avec Vitest.
// Le cookie ne contient que des identifiants, séparés par des virgules : "12,3,45".

import { parsePositiveInt } from './params'

export const RECENTLY_VIEWED_MAX = 10

/**
 * Ajoute un produit en tête de l'historique.
 * S'il y est déjà, il remonte en tête (pas de doublon).
 * Au-delà de `max`, les plus anciens sortent de la liste.
 */
export function pushRecentlyViewed(
  ids: number[],
  id: number,
  max = RECENTLY_VIEWED_MAX,
): number[] {
  const others = ids.filter((existing) => existing !== id)
  return [id, ...others].slice(0, max)
}

/**
 * Lit le cookie, quelle que soit sa forme : "12,3,45", 5, [1, 2]…
 * Les valeurs invalides ("abc", vides, négatives) et les doublons sont ignorés.
 * Un cookie illisible donne une liste vide : la page ne plante jamais.
 */
export function parseRecentlyViewedCookie(raw: unknown): number[] {
  let parts: unknown[]
  if (typeof raw === 'string') parts = raw.split(',')
  else if (typeof raw === 'number') parts = [raw]
  else if (Array.isArray(raw)) parts = raw
  else return []

  const ids: number[] = []
  for (const part of parts) {
    const id = parsePositiveInt(part)
    if (id !== null && !ids.includes(id)) ids.push(id)
  }
  return ids.slice(0, RECENTLY_VIEWED_MAX)
}

/** Transforme la liste en valeur de cookie : [12, 3, 45] → "12,3,45". */
export function serializeRecentlyViewed(ids: number[]): string {
  return ids.join(',')
}
