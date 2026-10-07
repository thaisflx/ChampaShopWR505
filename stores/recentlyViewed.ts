import { defineStore } from 'pinia'
import {
  parseRecentlyViewedCookie,
  pushRecentlyViewed,
  serializeRecentlyViewed,
} from '~/utils/recentlyViewed'

const COOKIE_NAME = 'recently_viewed'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 jours

export interface RecentlyViewedStore {
  ids: ComputedRef<number[]>
  add: (id: number) => void
  clear: () => void
}

export const useRecentlyViewedStore = defineStore(
  'recentlyViewed',
  (): RecentlyViewedStore => {
    // Le cookie est lu côté serveur : la liste est là dès le HTML, sans flash.
    // `unknown` : on ne fait pas confiance à son contenu, il peut avoir été modifié.
    const cookie = useCookie<unknown>(COOKIE_NAME, {
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: 'lax',
      path: '/',
    })

    const ids = computed(() => parseRecentlyViewedCookie(cookie.value))

    // Cookie corrompu ou modifié à la main : on l'ignore et on le réécrit propre.
    const clean = serializeRecentlyViewed(ids.value)
    if (cookie.value != null && String(cookie.value) !== clean) {
      cookie.value = clean || null
    }

    function add(id: number): void {
      cookie.value = serializeRecentlyViewed(pushRecentlyViewed(ids.value, id))
    }

    function clear(): void {
      cookie.value = null // null = cookie supprimé
    }

    return { ids, add, clear }
  },
)
