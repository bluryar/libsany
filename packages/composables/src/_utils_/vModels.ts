import type { Ref, UnwrapRef } from 'vue'

export type VModels<P extends Record<string, Ref<unknown>>> = { [Key in keyof P]: UnwrapRef<P[Key]> } & Record<`onUpdate:${Exclude<keyof P, Symbol>}`, (val: UnwrapRef<P[keyof P]>) => any>

/**
 * 快速创建双向绑定对象vModel, 支持重命名
 *
 * *通常用于 JSX 或者 h函数 传递props*
 *
 * @example
 * ```ts
 * const foo = ref(0)
 *
 * vModels({ foo }) // => { foo: Ref<number>, 'onUpdate:foo': (v: number) => void }
 *
 * // 重命名
 * vModels({ bar: foo }) // => { bar: Ref<number>, 'onUpdate:bar': (v: number) => void }
 * ```
 */
export function vModels <P extends Record<string, Ref<unknown>>>(input: P): VModels<P> {
  return Object.entries(input).reduce((obj, [k, v]) => {
    obj[k] = v.value
    obj[`onUpdate:${k}`] = (val: unknown) => { v.value = val }
    return obj
  }, {} as any)
}
