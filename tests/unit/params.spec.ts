import { describe, expect, it } from 'vitest'
import { parsePositiveInt } from '../../utils/params'

describe('parsePositiveInt', () => {
  it('lit un entier positif', () => {
    expect(parsePositiveInt('12')).toBe(12)
  })

  it('prend la première valeur si on reçoit un tableau', () => {
    expect(parsePositiveInt(['7', '8'])).toBe(7)
  })

  it.each(['abc', '0', '-3', '1.5', '', null, undefined])(
    'renvoie null pour « %s »',
    (value) => {
      expect(parsePositiveInt(value)).toBeNull()
    },
  )
})
