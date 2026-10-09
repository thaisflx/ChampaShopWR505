import { defineStore } from 'pinia'
import {
  MAX_COMPARE,
  parseCompareIds,
  toggleCompare,
  type ToggleCompareResult,
} from '~/utils/compare'

const COOKIE_NAME = 'compare'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 jours

export interface CompareStore {
  ids: ComputedRef<number[]>
  count: ComputedRef<number>
  isFull: ComputedRef<boolean>
  has: (id: number) => boolean
  toggle: (id: number) => ToggleCompareResult
  replace: (next: number[]) => void
  clear: () => void
}

export const useCompareStore = defineStore('compare', (): CompareStore => {
  // Lu côté serveur : la sélection est présente dès le HTML, sans flash.
  // `unknown` : le contenu du cookie peut avoir été modifié à la main.
  const cookie = useCookie<unknown>(COOKIE_NAME, {
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax',
    path: '/',
  })

  const ids = computed(() => parseCompareIds(cookie.value))
  const count = computed(() => ids.value.length)
  const isFull = computed(() => ids.value.length >= MAX_COMPARE)

  function save(next: number[]): void {
    cookie.value = next.length > 0 ? next.join(',') : null // null = supprimé
  }

  // Cookie corrompu ou modifié à la main : on l'ignore et on le réécrit propre.
  if (cookie.value != null && String(cookie.value) !== ids.value.join(',')) {
    save(ids.value)
  }

  function has(id: number): boolean {
    return ids.value.includes(id)
  }

  function toggle(id: number): ToggleCompareResult {
    const result = toggleCompare(ids.value, id)
    if (!result.rejected) save(result.ids)
    return result
  }

  function replace(next: number[]): void {
    save(parseCompareIds(next))
  }

  function clear(): void {
    save([])
  }

  return { ids, count, isFull, has, toggle, replace, clear }
})
