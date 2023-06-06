import { toTypeString } from './misc'

export const isString = (val: unknown): val is string => typeof val === 'string'

export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'

export const isNumber = (val: unknown): val is number => typeof val === 'number'

export const isBigint = (val: unknown): val is bigint => typeof val === 'bigint'

export const isUndefined = (val: unknown): val is undefined => typeof val === 'undefined'

export const isUndef = isUndefined

export const isNull = (val: unknown): val is null => val === null

export const isNil = (val: unknown): val is null | undefined => isNull(val) || isUndef(val)

export const isFalse = (val: unknown): val is false => isBoolean(val) && val === false

export const isTrue = (val: unknown): val is true => isBoolean(val) && val === true

export function isObject <Type extends Record<any, any> = Record<any, any>>(val: unknown): val is Type {
  return val !== null && typeof val === 'object'
}

export function isPlainObject(val: unknown): val is object {
  return toTypeString(val) === '[object Object]'
}

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export const isArray = <T = any >(val: unknown): val is T[] => Array.isArray(val)

export function isMap <K = any, V = any>(val: unknown): val is Map<K, V> {
  return toTypeString(val) === '[object Map]'
}

export function isSet <V = any>(val: unknown): val is Set<V> {
  return toTypeString(val) === '[object Set]'
}

export function isDate(val: unknown): val is Date {
  return toTypeString(val) === '[object Date]'
}

export function isRegExp(val: unknown): val is RegExp {
  return toTypeString(val) === '[object RegExp]'
}

export function isPromise <T = any>(val: unknown): val is Promise<T> {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}
