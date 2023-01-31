import type { Options as UseRequestOptions } from 'vue-request'
import { useRequest } from 'vue-request'
import { type InjectionKey, inject, provide } from 'vue'

export interface UseFormRequestOptions<Params = {}, Response = {}> extends UseRequestOptions<Response, [OnlyParams:Params] > {}

export interface UseFormRequestInjection {
  foo?: number
}

const UseFormRequestKey: InjectionKey<UseFormRequestInjection> = Symbol('UseFormRequestKey')

/**
 * 注入表单的状态、请求函数、检验函数等.
 *
 * 常用于使用了`useFormRequest`的子组件中，获取上层的状态
 */
export function useFormRequestInject(params?: UseFormRequestInjection) {
  return inject(UseFormRequestKey, {
    ...params,
  })
}

function useFormRequestProvide(params: UseFormRequestInjection) {
  return provide(UseFormRequestKey, params)
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
 * } = useFormRequest()
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
 * } = useFormRequest()
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
export function useFormRequest<Params = {}, Response = {}>(
  service: (params?: Params) => Promise<Response>,
  options: UseFormRequestOptions<Params, Response> = {
    // 表单请求一般不会自动发送
    manual: !!1,
  },
) {
  const requestData = useRequest(service, options)

  // 向下注入
  useFormRequestProvide({
    // TODO
  })

  return {
    ...requestData,
  }
}
