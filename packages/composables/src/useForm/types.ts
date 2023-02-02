import type { Ref, ShallowRef } from 'vue-demi'
import type { MaybeComputedRef } from '@vueuse/shared'
import type { LiteralUnion } from 'type-fest'
import type { UseFormRequestOptions, UseFormRequestReturns } from './useFormRequest'

export interface FormInstance {
  validate: <P extends unknown[]>(...args: P) => Promise<unknown> | void
  [k: string]: any
}
export type KeyOf<Params = {}> = LiteralUnion<keyof Params, string>
type Rule = (val: unknown) => boolean
type Rules = Rule | Rule[]

export interface UseFormOptions<Params = {}, Response = {}> extends UseFormRequestOptions<Params, Response> {
  /**
   * 请求函数
   *
   * @param params 通常情况下你不需要传入这个参数，这个参数会被返回的`run`和`runAsync`参数
   * @returns
   */
  service: (params?: Partial<Params>) => Promise<Response>

  /**
   * 表单的数据模型， ES6的类语法。
   *
   * 由于某些组件库属性如果不显示声明未undefined就不会进行校验
   *
   * ! 因此请将所有属性都显示的赋值 ( 包括 `undefined` )
   */
  Model: new (params?: Partial<Params>) => Params

  default?: MaybeComputedRef<Partial<Params>>

  /**
   * 表单实例，假如不为空，hook内部不会声明这个ref（shallow）
   *
   * @default undefined
   */
  formRef?: Ref<FormInstance | null> | ShallowRef<FormInstance | null>

  /**
   * 校验规则
   *
   * @default {}
   */
  rules?: Record<KeyOf<Params>, Rules>

  /**
   * 表单校验函数，在发起请求前调用.
   *
   * 假如校验失败，请抛出一个异常
   *
   * @default ()=>Promise<void>
   */
  validate?: () => Promise<void> | never

  /**
   * 校验失败
   *
   * @default ()=>void
   */
  onValidateFail?: (...args: unknown[]) => void
}

export interface UseFormReturns<Params = {}, Response = {}> extends UseFormRequestReturns<Params, Response> {
  /**
   * 表单组件实例，如果由传入就复用传入的，没有就创建一个待用
   */
  formRef: ShallowRef<FormInstance | null>

  /**
   * 表单参数，用于页面编辑
   */
  formParams: Ref<Partial<Params>>

  /**
   * @desc 提交表单
   *
   * @example
   * ```ts
   * const { submit } = useForm({ service: () => Promise.resolve(), Model: class Test {} })
   *
   * const onClick = () => { submit() }
   * ```
   *
   * @returns 一般不需要使用这个返回值
   */
  submit: () => Promise<Response | undefined>

  /**
   * 重置表单字段
   * @returns
   */
  reset: () => void
}
