import { describe, expect, it } from 'vitest'
import * as Misc from './misc'

describe('function: NOOP', () => {
  it('should not return empty object and be a dry run function', () => {
    expect(Misc.NOOP()).toBeUndefined()
  })
})

describe('function: NO', () => {
  it('should return false', () => {
    expect(Misc.NO()).toBeFalsy()
  })
})

describe('function: toTypeString', () => {
  it('should return Object type', () => {
    expect(Misc.toTypeString(NaN)).toBe('[object Number]')
    expect(Misc.toTypeString(true)).toBe('[object Boolean]')
    expect(Misc.toTypeString('')).toBe('[object String]')
    expect(Misc.toTypeString(new Date())).toBe('[object Date]')
    expect(Misc.toTypeString({})).toBe('[object Object]')
    expect(Misc.toTypeString(() => {})).toBe('[object Function]')
    expect(Misc.toTypeString(Symbol('test'))).toBe('[object Symbol]')

    expect(Misc.toTypeString('')).not.toBe('[object string]')
  })
})

describe('function: toRawType', () => {
  it('should return Object type String', () => {
    expect(Misc.toRawType('')).toBe('String')
    expect(Misc.toRawType('')).not.toBe('string')
  })
})
