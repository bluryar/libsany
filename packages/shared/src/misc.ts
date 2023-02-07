import { merge } from 'lodash-es'

export const NOOP = () => {}

/**
 * Always return false.
 */
export const NO = (): false => false

export const objectToString = Object.prototype.toString

export const toTypeString = (value: unknown): string =>
  Object.prototype.toString.call(value)

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

export const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

/**
 * 创建实例对象， 进行对象的合并
 *
 * @param Clazz 类构造器
 * @param p 类的实例成员
 * @returns 类实例
 *
 * @example
 * ```ts
 * class Model {
 *   foo = 1
 *   bar = 2
 * }
 *
 * newClass(Model, { foo: 2 }) // => { foo: 2, bar: 2 }
 * ```
 */
export const newClass = <Params = {}>(
  Clazz: (new (p?: Partial<Params>) => Params) | (new () => Params),
  p?: Partial<Params>,
) => {
  const p1 = new Clazz(p || {})
  return merge(
    p1,
    p || {},
  )
}
