import { isArray, isPlainObject } from '@bluryar/shared'
import { set, toPath } from 'lodash-es'

/**
 * 对象属性路径转换 `obj[0].a.b => obj.0.a.b`
 */
export function normalizeKey(k: string) {
  return toPath(k).join('.')
}

interface ObjectToFlattenMapOptions {
  source: object

  prefix?: string
  map?: Map<any, any>
  depth?: number

  /**
   * @default 10
   */
  maxDepth?: number

  /**
   * 不进行深层遍历的key
   */
  shallowKeys?: string[]
}

/**
 * @desc 将JS对象转换为扁平的键值对
 *
 * @example
 * ```ts
 * {
 *   obj: { foo: 1 },
 *   arr: [
 *     { bar: 2 }
 *   ]
 * } // => [ [ 'obj.foo', 1 ], [ 'arr.0.bar': 2 ] ]
 *
 * ```
 */
export function objectToFlattenMap(options: ObjectToFlattenMapOptions): Map<string, unknown> {
  const { source: params, prefix, map = new Map(), depth = 0, maxDepth = 10, shallowKeys = [] } = options

  for (const [k, v] of Object.entries(params)) {
    const key = prefix ? `${prefix}.${k}` : k

    if (depth >= maxDepth)
      return map

    map.set(key, v)

    if (shallowKeys.includes(key))
      return map

    // 数组和普通对象
    if (isArray(v) || isPlainObject(v))
      objectToFlattenMap({ source: v, prefix: key, map, depth: depth + 1, shallowKeys })
  }
  return map
}

/**
 * 过滤 `recordMap` 的非叶子节点。 与 `objectToFlattenMap`方法 搭配使用
 */
export function filterFlattenMap(recordMap: Map<string, unknown>) {
  const list = Array.from(recordMap)
  const res = list.filter(
    ([prefix], _, arr) =>
      !arr.some(
        ([toCheckKey]) =>
          toCheckKey !== prefix && toCheckKey.startsWith((prefix)),
      ),
  )
  return new Map(res)
}

/**
 * `objectToFlattenMap` 的反作用， 根据map重建一个对象
 */
export function flattenMapToObject(flattenMap: Map<string, unknown>): object {
  const target = {}

  Array.from(filterFlattenMap(flattenMap)).forEach(([key, val]) => {
    set(target, key, val)
  })

  return target
}
