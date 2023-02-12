import { describe, expect, it } from 'vitest'
import {
  filterFlattenMap,
  flattenMapToObject,
  normalizeKey,
  objectToFlattenMap,
} from './object'

const source = {
  foo: 1,
  obj: {
    nestedObj: {
      bar: 2,
      nestObj2: {
        bar: 3,
      },
    },
  },
  arr: [
    { foo: 1 },
  ],
}

describe('function: normalizeKey', () => {
  it('should transform path', () => {
    const source = 'obj[0].a.b[100]'
    const res = normalizeKey(source)
    expect(res).toMatchInlineSnapshot('"obj.0.a.b.100"')
  })
})

describe('function: objectToFlattenMap', () => {
  it('should transform nested object to map', () => {
    const target = objectToFlattenMap({ source })

    expect(target).toMatchInlineSnapshot(`
      Map {
        "foo" => 1,
        "obj" => {
          "nestedObj": {
            "bar": 2,
            "nestObj2": {
              "bar": 3,
            },
          },
        },
        "obj.nestedObj" => {
          "bar": 2,
          "nestObj2": {
            "bar": 3,
          },
        },
        "obj.nestedObj.bar" => 2,
        "obj.nestedObj.nestObj2" => {
          "bar": 3,
        },
        "obj.nestedObj.nestObj2.bar" => 3,
        "arr" => [
          {
            "foo": 1,
          },
        ],
        "arr.0" => {
          "foo": 1,
        },
        "arr.0.foo" => 1,
      }
    `)
  })

  it('should skip the keys of options.ignores params', () => {
    const target = objectToFlattenMap({
      source: { ...source, ...{ plgs: Array.from({ length: 100000 }).map((_, idx) => ({ foo: idx })) } },
      shallowKeys: [
        'plgs',
      ],
    })
    expect(target.get('plgs')).not.toBeUndefined()
    expect(target.get('plgs.0')).toBeUndefined()
    expect(target.get('plgs.99999')).toBeUndefined()
  })
})

describe('function: filterFlattenMap', () => {
  it('should remove non leaf node', () => {
    const target = filterFlattenMap(objectToFlattenMap({ source }))

    expect(target).toMatchInlineSnapshot(`
      Map {
        "foo" => 1,
        "obj.nestedObj.bar" => 2,
        "obj.nestedObj.nestObj2.bar" => 3,
        "arr.0.foo" => 1,
      }
    `)
  })
})

describe('function: flattenMapToObject', () => {
  it('should', () => {
    const target = flattenMapToObject(filterFlattenMap(objectToFlattenMap({ source })))
    expect(target).toMatchInlineSnapshot(`
      {
        "arr": [
          {
            "foo": 1,
          },
        ],
        "foo": 1,
        "obj": {
          "nestedObj": {
            "bar": 2,
            "nestObj2": {
              "bar": 3,
            },
          },
        },
      }
    `)

    // 结构相似但是不是同一个对象
    expect(target).toEqual(source)
    expect(target).not.toBe(source)
  })
})
