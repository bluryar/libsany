import { isArray, isPlainObject } from '@bluryar/shared'
import { set, toPath } from 'lodash-es'

/**
 * 对象属性路径转换 `obj[0].a.b => obj.0.a.b`
 */
export function normalizeKey(k: string) {
  return toPath(k).join('.')
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
export function objectToFlattenMap(params: object, prefix?: string, map = new Map(), depth = 0, maxDepth = 10): Map<string, unknown> {
  for (const [k, v] of Object.entries(params)) {
    const key = prefix ? `${prefix}.${k}` : k

    map.set(key, v)

    if (depth >= maxDepth) {
      console.warn('[toPathMap] 递归深度太深, 提前退出...')

      return map
    }

    // 数组和普通对象
    if (isArray(v) || isPlainObject(v))
      objectToFlattenMap(v, key, map, depth + 1)
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
