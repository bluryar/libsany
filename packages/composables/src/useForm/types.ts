import type { Ref, ShallowRef } from 'vue-demi'
import type { MaybeComputedRef } from '@vueuse/shared'
import type { LiteralUnion } from 'type-fest'
import type { UseFormRequestOptions, UseFormRequestReturns } from './_useFormRequest'
import type { useFormRules } from './_useFormRules'

export type MaybeShallowRef<T> = Ref<T> | ShallowRef<T>

export interface FormInstance {
  [k: string]: any
}
export type KeyOf<Params = {}> = LiteralUnion<keyof Params, string>

export type AsyncRule<T = unknown> = (val: T) => Promise<boolean | string>
export type SyncRule<T = unknown> = (val: T) => boolean | string

/** 规则返回要么是校验通过校验， 要么校验失败显示错误信息 */
export type Rule<T = unknown> = SyncRule<T> | AsyncRule<T>

export type Rules<T = unknown> = Rule<T> | Rule<T>[]

export interface UseFormOptions<Params = {}, Response = {}> {

  /**
   * 请求函数
   *
   * @param params 通常情况下你不需要传入这个参数，这个参数会被返回的`run`和`runAsync`参数
   * @returns
   */
  service: (params?: Partial<Params> | Params) => Promise<Response>

  /**
   * 表单的数据模型， ES6的类语法。
   *
   * 由于某些组件库属性如果不显示声明未undefined就不会进行校验
   *
   * ! 因此请将所有属性都显示的赋值 ( 包括 `undefined` )
   */
  Model: new (params?: Partial<Params>) => Params

  /**
   * 默认参数，某些情况下，表单会有某些字段需要默认值
   *
   * 甚至同一个表单组件在不同状态下会有不同的默认值，因此这样不适合用类声明的默认值来解决这一需求
   */
  defaultParams?: MaybeComputedRef<Partial<Params>>

  /**
   * 校验规则
   *
   * @default {}
   */
  rules?: MaybeComputedRef<Partial<Record<KeyOf<Params>, Rules>>>

  /**
   * 表单实例，假如不为空，hook内部不会声明这个ref（shallow）
   *
   * @default undefined
   */
  formRef?: MaybeShallowRef<FormInstance | null>

  /**
     * @desc - 网络请求的参数
     *
     * [请查看 📄 UseRequest.Options](https://next.cn.attojs.org/api/#options)
     */
  formRequest?: UseFormRequestOptions<Params, Response>

  /**
   * 规则校验不再实时监听
   *
   * @default false
   */
  lazyVerify?: boolean
}

export interface UseFormReturns<Params = {}, Response = {}> extends ReturnType<typeof useFormRules<Params>> {
  /**
   * 表单组件实例，如果由传入就复用传入的，没有就创建一个待用
   */
  formRef: ShallowRef<FormInstance | null>

  /**
   * 表单参数，用于页面编辑
   */
  formParams: Ref<Partial<Params>>

  /**
   * @desc - 网络请求的返回值
   *
   * [📄 UseRequest.Returns](https://next.cn.attojs.org/api/#return-values)
   */
  formRequest: UseFormRequestReturns<Params, Response>

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
  submit: (params?: Partial<Params>, options?: SubmitOptions) => Promise<Response> | never

  /**
   * 重置表单字段
   * @returns
   */
  reset: (fields?: KeyOf<Params>[]) => void
}

export interface SubmitOptions<Params = {}> {
  /**
   * 跳过表单校验
   *
   * @default false
   */
  skipValid?: boolean

  /**
   * 需要校验的字段, 默认为空, 为空则校验全部
   *
   * @default undefined
  */
  fields?: KeyOf<Params>[]

  onBeforeVerify?: (fields?: KeyOf<Params>[]) => Promise<void>

  onAfterVerify?: (fields?: KeyOf<Params>[]) => Promise<void>
}

export interface FormStatus {
  isDirty: boolean
  isError: boolean
  message: string
}
