/**
 * Enveloppe une tâche asynchrone pour qu'elle ne tourne qu'une fois à la fois.
 * Tant que la première exécution n'est pas finie, tous les appelants reçoivent
 * la MÊME promesse. Quand elle se termine (succès ou échec), le verrou saute.
 *
 * Fonction pure : aucune dépendance à Vue, Nuxt ou Pinia -> testable avec Vitest.
 */
export function createSingleFlight<T>(
  task: () => Promise<T>,
): () => Promise<T> {
  let pending: Promise<T> | null = null

  return () => {
    if (pending === null) {
      pending = task().finally(() => {
        pending = null
      })
    }
    return pending
  }
}
