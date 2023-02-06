import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  mergeProps,
  readonly,
  shallowRef,
} from 'vue-demi'
import type {
  DefineComponent,
  ExtractPropTypes,
  ShallowRef,
  // FunctionalComponent,
} from 'vue-demi'
import { resolveUnref } from '@vueuse/shared'
import type { MaybeComputedRef } from '@vueuse/shared'

import type { DefineLooseProps } from '../types'

export interface UseComponentWrapperOptions<Props extends Record<string, any>, ComponentRef = unknown> {
  /** 【必传】需要处理的组件 */
  component: DefineComponent<Props, any, any>

  ref?: ShallowRef<ComponentRef | null>

  /** 弹窗的props，一般用于定义一些在非动态获取的props，比如非接口返回值 */
  state?: MaybeComputedRef<Partial<ExtractPropTypes<Props>> & { [key: string]: any }>
}

/**
 * @desc - 使用 `defineComponent` 创建一个包裹组件，函数将返回新声明的组件 `Wrapper` 和 原组件需要绑定的Props `getState`。
 *
 * props的优先级（高到低）：
 *
 * 1. 在模板或者JSX或者h函数中传递的Props
 * 2. 通过 `setState` 传递参数
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
 * const { Wrapper, getState, setState } = useComponentWrapper({
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
 * setTimeout(() => { setState(() => ({ foo:4 })) }, 1000)
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
 * const { Wrapper, getState, setState } = useComponentWrapper({
 *   component: defineAsyncComponent(() => import('path/to/your/component'))
 * })
 * ```
 */
export function useComponentWrapper<Props extends Record<string, any>, ComponentInstance = unknown>(options: UseComponentWrapperOptions<Props, ComponentInstance>) {
  const {
    component,
    ref = shallowRef(null),
    state = () => ({}),
  } = options
  const vm = getCurrentInstance()

  if (vm === null)
    console.warn('[useComponentWrapper] 该函数建议在setup作用域内调用')

  const instance = shallowRef(ref)

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
      const exitsCount = checkList.filter((s) => {
        return Object.prototype.hasOwnProperty.call(s, k)
      })
      if (exitsCount.length > 1)
        console.warn('[useComponentWrapper] 建议用户不要将同一个属性从不同地方多次传入')
    })

    return obj as Partial<ExtractPropTypes<Props>>
  }
  const wrapperState = computed(resolveState)

  const UseComponentWrapper: DefineComponent<Props> = defineComponent({
    name: 'UseComponentWrapper',
    __name: 'UseComponentWrapper',
    setup(props, ctx) {
      cmpState.value = mergeProps({}, ctx.attrs, props as any)
      return () => h(component as DefineComponent, {
        ...resolveUnref(wrapperState),
        ref: el => instance.value = el as any,
      }, ctx.slots)
    },
  })
  // const UseComponentWrapper: FunctionalComponent<ExtractPropTypes<Props>> = (props, ctx) => {
  //   cmpState.value = mergeProps({}, ctx.attrs, props as any)
  //   return h(component as Component, resolveUnref(wrapperState), ctx.slots)
  // }
  // UseComponentWrapper.__name = 'UseComponentWrapper'
  // UseComponentWrapper.displayName = 'UseComponentWrapper'

  function invoke(_state?: typeof state | MaybeComputedRef<undefined>) {
    ivkState.value = resolveUnref(_state)
  }

  return {
    /** 被包裹的组件，它包裹的组件的状态不仅可以通过它的props进行“透传”，也可以通过`setState`方法进行传递，也可以通过配置options.state传递 */
    Wrapper: UseComponentWrapper,

    /**
     * - 依赖于`getState`创建的只读属性副本
     * */
    state: readonly(wrapperState),

    /**
     * 被代理的组件的props，它会合并从代理组件传递过来的props、setState方法传递的props，以及options.state
     *
     * 合并优先级从高到底，即在返回的代理组件<Wrapper>中配置属性的优先级最高
     */
    getState: resolveState,

    /**
     * 设置被代理组件的状态，通常这个方法用于设置接口返回值。
     */
    setState: invoke,

    /** 内部组件的实例 */
    instance,
  }
}
