import { type Options as UseRequestOptions, useRequest } from 'vue-request'
import { omit, pick } from 'lodash-es'
import type { TupleToUnion } from 'type-fest'
import type { Ref } from 'vue-demi'

export const OmittedOptionsKeys = ['defaultParams'] as const
export const OmittedReturnsKeys = ['params', 'error', 'data'] as const

export interface UseFormRequestOptions<Params = {}, Response = {}> extends Omit<
  UseRequestOptions<Response, [OnlyParams?: Partial<Params>]>,
  TupleToUnion<typeof OmittedOptionsKeys>
> {
  /**
   * 是否立即发起请求，默认行为调整为否
   *
   * @default true
   */
  manual?: boolean
}
export interface UseFormRequestReturns<Params = {}, Response = {}> extends Omit<
  ReturnType<typeof useRequest<Response, [OnlyParams?: Partial<Params>]>>,
  TupleToUnion<typeof OmittedReturnsKeys>
> {
  /**
   * @desc 请求发生错误，由于表单有校验错误和请求错误之分，因此重命名
   *
   * @alias error 将原来返回值中的`error`重命名
   */
  requestError: Ref<Error | undefined>

  /**
   * @desc 请求响应数据，通常情况下你不需要这个返回值，因为表单请求多为 post 和 put
   *
   * @alias data 将原来返回值中的`data`重命名
   */
  responseData: Ref<Response | undefined>
}

/**
 * 对 `import('vue-request').useRequest` 的入参出参微调， 去掉无用的配置， 修正类型
 *
 * 其余配置查看 [📄 vue-request](https://next.cn.attojs.org/api/#refresh)
 *
 * @params [options.manual] 默认=1
 */
export const useFormRequest = <Params = {}, Response = {}>(
  service: (params?: Partial<Params>) => Promise<Response>,
  options?: UseFormRequestOptions<Params, Response>,
): UseFormRequestReturns<Params, Response> => {
  const rawRes = useRequest(
    service,
    omit(
      {
        manual: !!1,
        ...options,
      },
      OmittedOptionsKeys,
    ),
  )

  const saveRes = pick(rawRes, OmittedOptionsKeys)

  return {
    ...omit(
      rawRes,
      OmittedReturnsKeys,
    ),
    responseData: saveRes.data!,
    requestError: saveRes.error!,
  }
}
