import { parsePositiveInt } from './params'

export const MAX_COMPARE = 3

export interface ToggleCompareResult {
  ids: number[]
  rejected: boolean
}

export function parseCompareIds(raw: unknown, max = MAX_COMPARE): number[] {
  const values = Array.isArray(raw) ? raw : [raw]
  const tokens: unknown[] = []
  for (const value of values) {
    if (typeof value === 'string') tokens.push(...value.split(','))
    else if (typeof value === 'number') tokens.push(value)
  }

  const ids: number[] = []
  for (const token of tokens) {
    const id = parsePositiveInt(token)
    if (id !== null && !ids.includes(id)) ids.push(id)
  }
  return ids.slice(0, max)
}

export function toggleCompare(
  ids: number[],
  id: number,
  max = MAX_COMPARE,
): ToggleCompareResult {
  if (ids.includes(id)) {
    return { ids: ids.filter((current) => current !== id), rejected: false }
  }
  if (ids.length >= max) {
    return { ids: [...ids], rejected: true }
  }
  return { ids: [...ids, id], rejected: false }
}
