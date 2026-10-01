import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from '../../utils/debounce'

describe('debounce', () => {
  // Faux minuteurs : on avance le temps à la main au lieu d'attendre vraiment.
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("n'appelle pas la fonction avant la fin du délai", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    vi.advanceTimersByTime(299)

    expect(fn).not.toHaveBeenCalled()
  })

  it('appelle la fonction une fois le délai écoulé', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('frappe rapide : un seul appel, avec la dernière valeur', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('p')
    vi.advanceTimersByTime(100)
    debounced('ph')
    vi.advanceTimersByTime(100)
    debounced('pho')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('pho')
  })

  it("cancel annule l'appel en attente", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    debounced.cancel()
    vi.advanceTimersByTime(300)

    expect(fn).not.toHaveBeenCalled()
  })
})
