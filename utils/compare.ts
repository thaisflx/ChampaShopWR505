import { parsePositiveInt } from './params'

export const MAX_COMPARE = 3

export function parseCompareIds(raw: unknown, max = MAX_COMPARE): number[] {
  const values = Array.isArray(raw) ? raw : [raw]
  const ids: number[] = []
  for (const value of values) {
    if (typeof value !== 'string') continue
    for (const token of value.split(',')) {
      const id = parsePositiveInt(token)
      if (id !== null && !ids.includes(id)) ids.push(id)
    }
  }
  return ids.slice(0, max)
}

export function toggleCompare(
  ids: number[],
  id: number,
  max = MAX_COMPARE,
): { ids: number[]; rejected: boolean } {
  if (ids.includes(id)) {
    return { ids: ids.filter((current) => current !== id), rejected: false }
  }
  if (ids.length >= max) {
    return { ids, rejected: true }
  }
  return { ids: [...ids, id], rejected: false }
}
