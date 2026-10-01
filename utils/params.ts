// Lecture des paramètres d'URL (route.params, route.query) : fonctions pures.

/**
 * Lit un entier positif (1, 2, 3…) dans un paramètre d'URL.
 * Si le paramètre est répété (`?page=2&page=5`), on prend la première valeur.
 * Renvoie null pour toute valeur invalide : absente, "abc", "0", "-2", "1.5".
 */
export function parsePositiveInt(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  const number = Number(raw)
  return Number.isInteger(number) && number >= 1 ? number : null
}
