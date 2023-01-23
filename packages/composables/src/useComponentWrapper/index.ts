import { type MaybeComputedRef, resolveUnref } from '@vueuse/core'
import type { Component } from 'vue'
import { defineComponent, getCurrentInstance, h, mergeProps, shallowRef } from 'vue'
import { isNull, merge } from 'lodash-es'
import type { DefineLooseProps, UseComponentWrapperOptions, UseComponentWrapperReturn } from './types'

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

  if (isNull(vm))
    console.warn('[useComponentWrapper] 该函数建议在setup作用域内调用')

  const cmpState = shallowRef<DefineLooseProps<Props>>({})
  const ivkState = shallowRef<DefineLooseProps<Props>>({})
  const resolveState = () => merge({}, resolveUnref(ivkState), resolveUnref(cmpState), resolveUnref(state))

  const Wrapper = defineComponent<DefineLooseProps<Props>>({
    name: 'UseComponentWrapper',
    __name: 'UseComponentWrapper',
    setup(props, ctx) {
      cmpState.value = mergeProps({}, ctx.attrs, props as any)
      return () => h(component as Component, resolveUnref(resolveState), ctx.slots)
    },
  })

  function invoke(state?: MaybeComputedRef<Partial<Props>>) {
    ivkState.value = resolveUnref(state)
  }

  return {
    Wrapper,
    getState: resolveState,
    invoke,
  }
}

export { useComponentWrapper }

export type { UseComponentWrapperOptions, UseComponentWrapperReturn }
