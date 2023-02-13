import { normalizeKey } from '@bluryar/shared'

/**
 * 将key为 `obj[0].a.b` 转换为 `obj.0.a.b`
 */
export function normalizeFormRulesObject(rulesTemplate: object, valueMap: (val: any) => any = val => val) {
  return Object.fromEntries(
    Object.entries(rulesTemplate).map(([k, v]) => {
      const key = normalizeKey(k)
      return [key, valueMap(v)]
    }),
  )
}
