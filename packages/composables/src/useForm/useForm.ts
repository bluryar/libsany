import { type Ref, ref, shallowRef, unref } from 'vue-demi'
import { resolveUnref } from '@vueuse/shared'
import { get } from 'lodash-es'
import { newClass } from '@bluryar/shared'
import { useFormRequest } from './_useFormRequest'
import type { FormInstance, KeyOf, SubmitOptions, UseFormOptions, UseFormReturns } from './types'
import { useFormRules } from './_useFormRules'
import { useFormProvide } from './useFormProvide'

/**
 * @desc **Features**: 表单状态管理、网络请求以及规则校验函数
 *
 * @examples
 * _Parent_
 * ```html
 * <script setup lang="ts">
 * import Child from './Child'
 *
 * const {
 *   submit, reset, verify, clearErrors, formParams
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
 *   submit, reset, verify, clearErrors, formParams
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
export function useForm<Params = {}, Response = {} >(
  options: UseFormOptions<Params, Response>,
): UseFormReturns<Params, Response> {
  const {
    Model, service, defaultParams = () => ({}), rules, formRef: _formRef = shallowRef<null | FormInstance>(null),
  } = options

  const _createInitFormData = () => newClass(Model, resolveUnref(defaultParams))

  const formRef = shallowRef(_formRef)
  /** 发送请求时使用的参数 */
  const _requestParams = ref(_createInitFormData()) as Ref<Partial<Params>>
  /** 正在编辑的参数，即发送请求前使用的参数 */
  const formParams = ref(_createInitFormData()) as Ref<Partial<Params>>

  const requestResult = useFormRequest(
    (params?: Partial<Params>) => service({
      ...unref(_requestParams),
      ...resolveUnref(params),
    }),
    options,
  )

  const formRules = useFormRules<Params>(formParams, rules, options)

  async function submit(params?: Partial<Params>, options: SubmitOptions = {}) {
    const {
      skipValid = false,
      fields,
      onBeforeVerify: onBefore,
      onAfterVerify: onAfter,
    } = options

    if (!skipValid) {
      await onBefore?.(fields)
      await formRules.verifyAsync(fields)
      await onAfter?.(fields)
    }

    _requestParams.value = formParams.value
    return await requestResult.runAsync(params)
  }

  /**
   * @param fields 需要重置的字段，如果为空则重置所有
   */
  async function reset(fields?: KeyOf<Params>[]) {
    // 备份需要不重置的字段
    const bak = fields
      ? get(formParams.value, fields) ?? {}
      : formParams.value

    formParams.value = { ..._createInitFormData(), ...bak }
    _requestParams.value = formParams.value

    formRules.clearErrors(fields)
  }

  const returnVal: UseFormReturns<Params, Response> = {
    ...requestResult,
    ...formRules,

    formRef,
    formParams,
    submit,
    reset,
  }

  // 向下注入
  useFormProvide(returnVal)

  return returnVal
}
