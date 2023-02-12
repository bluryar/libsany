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

describe('function: sleep', () => {
  it('should return await 200ms', async () => {
    let foo = 1
    setTimeout(() => {
      foo = 2
    }, 100)
    expect(foo).toBe(1)
    await Misc.sleep(200)
    expect(foo).toBe(2)
  })
})

describe('function: newClassWithParams', () => {
  it('should merge params when create instance of Clazz', async () => {
    class Parent {
      foo = 1
      bar = 1
    }
    class Child extends Parent {
      far = 1
    }

    const c1 = new Child()
    const c2 = Misc.newClassWithParams(Child, { foo: 2, bar: 2 })

    expect(c1.foo).toBe(1)
    expect(c1.bar).toBe(1)
    expect(c1.far).toBe(1)
    expect(c2.foo).toBe(2)
    expect(c2.bar).toBe(2)
    expect(c2.far).toBe(1)
  })
})
