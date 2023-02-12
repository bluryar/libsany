import { type Options as UseRequestOptions, useRequest } from 'vue-request'
import { omit } from 'lodash-es'

export const OMITTED_OPTIONS_KEYS = ['defaultParams'] as const
export const OMITTED_RETURNS_KEYS = [] as const

export type Service<Params = object, Response = object> = (params?: Partial<Params>) => Promise<Response>

export interface UseFormRequestOptions<Params = {}, Response = {}> extends Omit<
  UseRequestOptions<Response, [OnlyParams?: Partial<Params>]>,
  (typeof OMITTED_OPTIONS_KEYS)[number]
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
  (typeof OMITTED_RETURNS_KEYS)[number]
> {}

/**
 * 对 `import('vue-request').useRequest` 的入参出参微调， 去掉无用的配置， 修正类型
 *
 * 其余配置查看 [📄 vue-request](https://next.cn.attojs.org/api/#refresh)
 *
 * @params [options.manual] 默认=1
 */
export const useFormRequest = <Params = {}, Response = {}>(
  service: Service<Params, Response>,
  options?: UseFormRequestOptions<Params, Response>,
): UseFormRequestReturns<Params, Response> => {
  const rawRes = useRequest(
    service,
    omit(
      {
        manual: !!1,
        ...options,
      },
      OMITTED_OPTIONS_KEYS,
    ),
  )

  return {
    ...omit(
      rawRes,
      OMITTED_RETURNS_KEYS,
    ),
  }
}
