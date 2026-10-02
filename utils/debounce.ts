// Debounce : n'exécute la fonction qu'une fois que les appels se sont arrêtés
// pendant `delay` millisecondes. Fonction pure, sans Vue : testable avec Vitest.

export const SEARCH_DEBOUNCE_MS = 300

export interface Debounced<Args extends unknown[]> {
  (...args: Args): void
  /** Annule l'appel en attente, s'il y en a un. */
  cancel: () => void
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel(): void {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  function run(...args: Args): void {
    // Chaque nouvel appel annule le précédent et relance le compte à rebours.
    cancel()
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, delay)
  }

  return Object.assign(run, { cancel })
}
