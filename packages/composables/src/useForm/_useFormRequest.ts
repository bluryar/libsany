import { type Options as UseRequestOptions, useRequest } from 'vue-request'
import { omit } from 'lodash-es'
import type { TupleToUnion } from 'type-fest'

export const OmittedOptionsKeys = ['defaultParams'] as const
export const OmittedReturnsKeys = ['params'] as const

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
export type UseFormRequestReturns<Params = {}, Response = {}> = Omit<
  ReturnType<typeof useRequest<Response, [OnlyParams?: Partial<Params>]>>,
  TupleToUnion<typeof OmittedReturnsKeys>
>

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
  return omit(
    useRequest(
      service,
      omit(
        {
          manual: !!1,
          ...options,
        },
        OmittedOptionsKeys,
      ),
    ),
    OmittedReturnsKeys,
  )
}
