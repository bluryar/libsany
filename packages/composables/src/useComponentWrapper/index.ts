import { defineComponent, getCurrentInstance, h, mergeProps, shallowRef } from 'vue-demi'
import { resolveUnref } from '@vueuse/shared'
import type { MaybeComputedRef } from '@vueuse/shared'

import type {
  AllowedComponentProps,
  Component,
  DefineComponent,
  Events,
  ExtractPropTypes,
  VNodeProps,
} from 'vue'

type DefineProps<Props = Record<string, any>> = AllowedComponentProps & VNodeProps & Events & ExtractPropTypes<Props> & { [x: string]: any }
type DefineLooseProps<Props = Record<string, any>> = Partial<DefineProps<Props>>

interface UseComponentWrapperOptions<Props = Record<string, any>> {
  component: DefineComponent<Props, any, any>
  state?: MaybeComputedRef<Partial<ExtractPropTypes<Props>> & { [key: string]: any }>
}

/**
 * @desc - 使用 `defineComponent` 创建一个包裹组件，函数将返回新声明的组件 `Wrapper` 和 原组件需要绑定的Props `getState`。
 *
 * props的优先级（高到低）：
 *
 * 1. 在模板或者JSX或者h函数中传递的Props
 * 2. 通过 `invoke` 传递参数
 * 3. 通过 `useComponentWrapper` 传递的参数
 *
 * ---
 *
 * **1. 一般用法**
 *
 * @example
 * ```ts
 * import { useComponentWrapper } from '@bluryar/composables'
 * import { defineComponent, h } from 'vue'
 *
 * const { Wrapper, getState, invoke } = useComponentWrapper({
 *   component: defineComponent({
 *     name: 'Test',
 *     props: {
 *       foo: { type: Number, default: 1 }
 *     }
 *   }),
 *   state: () => ({ foo: 2 })
 * })
 *
 * // 此时foo === 3
 * h(Wrapper, { foo: 3 })
 *
 * // 1s后foo=4
 * setTimeout(() => { invoke(() => ({ foo:4 })) }, 1000)
 * ```
 *
 * ---
 *
 * **2. 异步组件**
 *
 * @example
 * ```ts
 * import { useComponentWrapper } from '@bluryar/composables'
 * import { defineAsyncComponent } from 'vue'
 *
 * const { Wrapper, getState, invoke } = useComponentWrapper({
 *   component: defineAsyncComponent(() => import('path/to/your/component'))
 * })
 * ```
 */
const useComponentWrapper = <Props = Record<string, any>>({
  component,
  state = () => ({}),
}: UseComponentWrapperOptions<Props>) => {
  const vm = getCurrentInstance()

  if (vm === null)
    console.warn('[useComponentWrapper] 该函数建议在setup作用域内调用')

  const cmpState = shallowRef<DefineLooseProps<Props>>({})
  const ivkState = shallowRef<DefineLooseProps<Props>>({})
  const resolveState = () => {
    const _state = resolveUnref(state)
    const _ivkState = resolveUnref(ivkState)
    const _cmpState = resolveUnref(cmpState)

    // 检查属性是否重复，为了避免出现无法调试的BUG，建议用户不要将同一个属性从不同地方多次传入
    const obj = ({ ...{}, ...(_state), ...(_ivkState), ...(_cmpState) })

    const checkList = [_state ?? {}, _ivkState ?? {}, _cmpState ?? {}]

    // 检查是否重复设置状态，重复设置不利于维护
    Object.keys(obj).forEach((k) => {
      const exits = checkList.filter((s) => {
        return Object.prototype.hasOwnProperty.call(s, k)
      })
      if (exits.length > 1)
        console.warn('[useComponentWrapper] 建议用户不要将同一个属性从不同地方多次传入, 大多数情况下推荐使用`options.state`来传递参数, 模板传值仅推荐进行双向绑定, `invoke`方法推荐传入那些动态获取的值')
    })

    return obj
  }

  const Wrapper = defineComponent<DefineLooseProps<Props>>({
    name: 'UseComponentWrapper',
    __name: 'UseComponentWrapper',
    setup(props, ctx) {
      cmpState.value = mergeProps({}, ctx.attrs, props as any)
      return () => h(component as Component, resolveUnref(resolveState), ctx.slots)
    },
  })

  function invoke(_state?: typeof state) {
    ivkState.value = resolveUnref(_state)
  }

  return {
    Wrapper,
    getState: resolveState,
    invoke,
  }
}

export { useComponentWrapper }

export type { UseComponentWrapperOptions }
