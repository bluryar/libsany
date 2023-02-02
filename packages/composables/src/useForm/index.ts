import { type InjectionKey, type Ref, inject, provide, ref, shallowRef, unref } from 'vue-demi'
import { resolveUnref } from '@vueuse/shared'
import { get } from 'lodash-es'
import { useFormRequest } from './useFormRequest'
import type { FormInstance, KeyOf, UseFormOptions, UseFormReturns } from './types'

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

function useFormProvide<Params = {}, Response = {}>(params: UseFormReturns<Params, Response>) {
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
export function useForm<Params = {}, Response = {}>(options: UseFormOptions<Params, Response>): UseFormReturns<Params, Response> {
  const {
    Model,
    service,
    // rules = [],
    validate = () => Promise.resolve(),
    onValidateFail = () => {},
  } = options

  const formRef = shallowRef(options.formRef ?? shallowRef<null | FormInstance>(null))

  /** 发送请求时使用的参数 */
  const requestParams = ref(new Model()) as Ref<Partial<Params>>
  /** 正在编辑的参数，即发送请求前使用的参数 */
  const formParams = ref(new Model()) as Ref<Partial<Params>>

  const requestResult = useFormRequest(
    (params?: Partial<Params>) => service({ ...unref(requestParams), ...resolveUnref(params) }),
    options,
  )

  const submit = async (params?: Partial<Params>) => {
    try {
      await validate()

      requestParams.value = formParams.value

      return requestResult.runAsync(params)
    }
    catch (error) {
      onValidateFail(error)
    }
  }

  const reset = (fields?: KeyOf<Params>) => {
    const bak = fields ? get(formParams.value, fields) ?? {} : {}

    formParams.value = new Model(bak)
    requestParams.value = formParams.value
  }

  const returnVal = {
    ...requestResult,

    formRef,

    formParams,

    submit,

    reset,
  }

  // 向下注入
  useFormProvide(returnVal)

  return returnVal
}
