import { describe, expect, it } from 'vitest'
import { diffKeys } from './diffProps'

describe('diffKeys', () => {
  it('returns no keys when nothing changed', () => {
    expect(diffKeys({ a: 1, b: 2 }, { a: 1, b: 2 })).toEqual([])
  })

  it('returns only the keys whose values changed', () => {
    expect(diffKeys({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual(['b'])
  })

  it('treats keys missing from prev as changed', () => {
    expect(diffKeys({}, { a: 1 })).toEqual(['a'])
  })

  it('uses Object.is, so NaN vs NaN is not a change', () => {
    expect(diffKeys({ a: NaN }, { a: NaN })).toEqual([])
  })

  it('treats +0 and -0 as different, matching Object.is semantics', () => {
    expect(diffKeys({ a: 0 }, { a: -0 })).toEqual(['a'])
  })
})
