import type { Options as UseRequestOptions } from 'vue-request'
import { useRequest } from 'vue-request'
import { type InjectionKey, type Ref, type ShallowRef, inject, provide, ref, shallowRef, unref } from 'vue-demi'
import { type MaybeComputedRef, resolveUnref } from '@vueuse/shared'
import type { Rule } from 'async-validator'

interface FormInstance {
  validate: <P extends unknown[]>(...args: P) => Promise<unknown> | void
  [k: string]: any
}

export interface UseFormOptions<Params = {}, Response = {}> extends UseRequestOptions<Response, [OnlyParams:Params] > {
  /**
   * 表单的数据模型， ES6的类语法。
   *
   * 由于某些组件库属性如果不显示声明未undefined就不会进行校验
   *
   * ! 因此请将所有属性都显示的赋值 ( 包括 `undefined` )
   */
  Model: new (params?: Params) => Params

  /**
   * 表单实例，假如不为空，hook内部不会声明这个ref（shallow）
   */
  formRef?: Ref<FormInstance | null> | ShallowRef<FormInstance | null>

  /**
   * 校验规则
   */
  rules?: Record<keyof Params & keyof { [x: string]: any }, Rule>

  /**
   * 表单校验函数，在发起请求前调用
   */
  validate?: () => Promise<void | never>

  onValidateFail?: (...args: unknown[]) => void
}

// export interface UseFormInjection {
//   foo?: number
// }

export type UseFormInjection<Params = {}, Response = {}> = ReturnType<typeof useForm<Params, Response>>

const UseFormKey: InjectionKey<UseFormInjection> = Symbol('UseFormKey')

/**
 * 注入表单的状态、请求函数、检验函数等.
 *
 * 常用于使用了`useForm`的子组件中，获取上层的状态
 */
export function useFormInject<Params = {}, Response extends Object = {}>(params?: UseFormInjection<Params, Response>) {
  const injection = inject(UseFormKey, params as object)
  if (!injection)
    console.error('[UseForm] 无法注入表单状态，也许上层没有调用 useForm 方法')
}

function useFormProvide<Params = {}, Response = {}>(params: UseFormInjection<Params, Response>) {
  return provide(UseFormKey, params as object)
}

/**
 * 将表单的业务逻辑（接口请求、表单校验等）交给组件本身，然后将表单的模板和样式抽象成一个单独的组件
 * - (这个子组件的script只需要处理与样式和模板相关的逻辑即可)
 * - 表单校验依赖于 `async-validator`，naive-ui、ant-design-vue、element-plus都依赖于它。
 *
 * @example
 *
 * _Parent_
 * ```html
 * <script setup lang="ts">
 * import Child from './Child'
 *
 * const {
 *   data,
 *   submit
 * } = useForm()
 *
 * // 其他逻辑
 * </script>
 *
 * <template>
 *   <div>
 *     <Child></Child>
 *   </div>
 * </template>
 * ```
 *
 * 如上，父组件管理者表单请求和表单校验、参数重置等操作，这些操作可以由其他元素的事件触发
 *
 * _Child_
 * ```html
 * <script setup lang="ts">
 * const {
 *   data,
 *   submit
 * } = useForm()
 *
 * // 其他逻辑
 * </script>
 *
 * <template>
 *   <div>
 *     <!-- 表单模板 -->
 *   </div>
 * </template>
 * ```
 *
 * 如上，子组件通过`inject`获取父元素注入的状态，完成页面的渲染
 */
export function useForm<Params = {}, Response = {}>(
  service: (params?: Partial<Params>) => Promise<Response>,
  options: UseFormOptions<Partial<Params>, Response>,
) {
  const { Model, validate = () => Promise.resolve() } = options

  const formRef = shallowRef(options.formRef ?? shallowRef<null | FormInstance>(null))

  /** 发送请求时使用的参数 */
  const requestParams = ref<Partial<Params>>(new Model())
  /** 正在编辑的参数，即发送请求前使用的参数 */
  const formParams = ref<Partial<Params>>(new Model())

  const requestData = useRequest(
    (params?: MaybeComputedRef<Partial<Params>>) => service({ ...unref(requestParams), ...resolveUnref(params) }),
    { manual: !!1, ...options },
  )

  const submit = async () => {
    try {
      await validate()

      requestParams.value = formParams.value

      return requestData.runAsync({})
    }
    catch (error) {
      options?.onValidateFail?.(error)
    }
  }

  const reset = async () => {
    formParams.value = new Model()
  }

  const returnVal = {
    /**
     * 表单组件实例，如果由传入就复用传入的，没有就创建一个待用
     */
    formRef,

    formData: formParams,

    submit,

    reset,

    ...requestData,
  }

  // 向下注入
  useFormProvide(returnVal)

  return returnVal
}
