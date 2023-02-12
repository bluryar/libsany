import { type InjectionKey, inject, provide } from 'vue-demi'
import type { UseFormReturns } from './types'

const UseFormKey: InjectionKey<UseFormReturns> = Symbol('UseFormKey')
/**
 * 注入表单的状态、请求函数、检验函数等.
 *
 * 常用于使用了`useForm`的子组件中，获取上层的状态
 */
export function useFormInject<Params = {}, Response = {}>(params?: UseFormReturns<Params, Response>) {
  const injection = inject(UseFormKey, (params || {}) as object)
  if (!injection)
    console.error('[UseForm] 无法注入表单状态，也许上层没有调用 useForm 方法')
}

export function useFormProvide<Params = {}, Response = {}>(params: UseFormReturns<Params, Response>) {
  provide(UseFormKey, params as object)

  return params
}
