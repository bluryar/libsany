import { isArray, isPlainObject } from '@bluryar/shared'
import { toPath } from 'lodash-es'

export function normalizeObject(rulesTemplate: object, valueMap: (val: any) => any = val => val) {
  return Object.fromEntries(
    Object.entries(rulesTemplate).map(([k, v]) => {
      const key = normalizeKey(k)
      return [key, valueMap(v)]
    }),
  )
}

/**
 * 对象属性路径转换 `obj[0].a.b => obj.0.a.b`
 */
function normalizeKey(k: string) {
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
export function toPathMap(params: object, prefix?: string, map = new Map(), depth = 0, maxDepth = 10): Map<string, unknown> {
  for (const [k, v] of Object.entries(params)) {
    const key = prefix ? `${prefix}.${k}` : k

    map.set(key, v)

    if (depth >= maxDepth) {
      console.warn('[toPathMap] 递归深度太深, 提前退出...')

      return map
    }

    // 数组和普通对象
    if (isArray(v) || isPlainObject(v))
      toPathMap(v, key, map, depth + 1)
  }
  return map
}

// const res = toPathMap({
//   test: {
//     test2: 1,
//   },
//   arr: [
//     { test: { test2: 2 } },
//   ],
// })
// console.log('🚀 ~ file: _utils.ts:55 ~ res', res)
