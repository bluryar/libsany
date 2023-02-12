import type { LiteralUnion } from 'type-fest'
import type { ComputedRef, Ref, ShallowRef } from 'vue-demi'
import type { MaybeComputedRef } from '@vueuse/shared'
import type { Service, UseFormRequestOptions, UseFormRequestReturns } from './_useFormRequest'
import type { FormItemStatus } from './FormItemStatus'
import type { FormItemChecker } from './FormItemChecker'

export type MaybeShallowRef<T> = Ref<T> | ShallowRef<T>
export type KeyOf<Params = {}> = LiteralUnion<keyof Params, string>
export interface FormInstance {
  [k: string]: any
}
export type SyncRule = (val: unknown) => boolean | string
export type AsyncRule = (val: unknown) => Promise<ReturnType<SyncRule>>
export type Rule = SyncRule | AsyncRule
export type Rules = Rule | Rule[]
export type RulesRecord<Params = {}> = {
  [P in KeyOf<Partial<Params>>]?: Rules;
}

export interface UseFormOptions<Params = {}, Response = {}> {
  /**
   * @description - 必传, 表单提交函数
   *  */
  service: Service<Params, Response>

  /**
   * @description - 必传, 用于初始化表单
   *
   * **这个参数会被深拷贝**
   *
   * 表单请求的默认参数, 这个
   */
  defaultParams: Params

  /**
   * @description - 表单校验规则
   *
   * @default {}
   */
  rules?: MaybeComputedRef<RulesRecord<Params>>

  /**
   * @description - 表单实例
   *
   * 假如不为空，hook内部不会声明这个ref（shallow）
   *
   * 用于传递给表单组件的 `ref` 选项, 获取表单expose的对象
   *
   * @default undefined
   */
  formRef?: MaybeShallowRef<FormInstance | null>

  /**
   * @description - 网络请求的参数
   *
   * [请查看 📄 UseRequest.Options](https://next.cn.attojs.org/api/#options)
   */
  formRequestOptions: UseFormRequestOptions<Params, Response>
}

export interface FormStatus<Params = {}> {
  errorsMap: ComputedRef<Map<KeyOf<Partial<Params>>, FormItemStatus>>
  dirtyMap: ComputedRef<Map<KeyOf<Partial<Params>>, FormItemStatus>>
  verifyingMap: ComputedRef<Map<KeyOf<Partial<Params>>, FormItemStatus>>

  isError: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>
  isVerifying: ComputedRef<boolean>

  errorKeys: ComputedRef<KeyOf<Partial<Params>>[]>
  dirtyKeys: ComputedRef<KeyOf<Partial<Params>>[]>
  verifyingKeys: ComputedRef<KeyOf<Partial<Params>>[]>

  dirtyParams: ComputedRef<Partial<Params>>
}

export interface UseFormReturns<Params = {}, Response = {}> {
  formRef: MaybeShallowRef<FormInstance | null>
  formParams: Ref<Partial<Params>>
  formRequestReturns: UseFormRequestReturns<Params, Response>
  formStatus: FormStatus<Params>
  formItemsStatus: Ref<Map<KeyOf<Params>, FormItemStatus>>

  formChecker: FormItemChecker<Params>
  validate: (fields?: KeyOf<Partial<Params>>[]) => Promise<boolean>
  clearErrors: (fields?: KeyOf<Partial<Params>>[]) => void

  submit: (fields?: KeyOf<Partial<Params>>[]) => Promise<Response>
  reset: (fields?: KeyOf<Partial<Params>>[]) => void

}
