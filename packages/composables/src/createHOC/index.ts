import { get, set } from 'lodash-es'
import {
  computed,
  effectScope,
  getCurrentInstance,
  h,
  mergeProps,
  readonly,
  shallowRef,
  watchEffect,
} from 'vue'
import type {
  DefineComponent,
  ExtractPropTypes,
  FunctionalComponent,
  ShallowRef,
} from 'vue'
import { toValue, tryOnScopeDispose } from '@vueuse/core'

import type { Component, ComponentProps, DefineLooseProps, SFCWithInstall } from '../types'

export interface createHOCOptions<Props extends Record<string, any>, ComponentRef = unknown> {
  /** 【必传】需要处理的组件 */
  component: SFCWithInstall<Component<Props>>

  ref?: ShallowRef<ComponentRef | null>

  /**
   * 组件的props，被代理的组件的props可以通过三种方式修改
   *
   * 注意：此处存在合并策略，函数返回的Wrapper组件的props优先级最高，这里设置的state优先级最低
   */
  state?: ComponentProps<Props>

  /** 单独指定某个属性的合并策略， 基于 `lodash` 的 `get` 和 `set` 函数实现 */
  stateMerge?: Record<string, (val: any, ivkState:any, cmpState:any) => any>
}

/**
 * @desc - 使用 `defineComponent` 创建一个包裹组件，函数将返回新声明的组件 `Wrapper` 和 原组件需要绑定的Props `getState`。
 *
 * props的优先级（高到低）：
 *
 * 1. 在模板或者JSX或者h函数中传递的Props
 * 2. 通过 `setState` 传递参数
 * 3. 通过 `createHOC` 传递的参数
 */
export function createHOC<Props extends Record<string, any>, ComponentInstance = unknown>(options: createHOCOptions<Props, ComponentInstance>) {
  const {
    component,
    ref = shallowRef(null),
    state = () => ({}),
    stateMerge = undefined,
  } = options
  const vm = getCurrentInstance()
  const scope = effectScope()

  if (vm === null)
    console.warn('[createHOC] 该函数建议在setup作用域内调用')

  const instance = shallowRef(ref)

  const cmpState = shallowRef<DefineLooseProps<Props>>({})
  const ivkState = shallowRef<DefineLooseProps<Props>>({})

  const resolveState = () => {
    const _state = toValue(state) ?? {}
    const _ivkState = toValue(ivkState) ?? {}
    const _cmpState = toValue(cmpState) ?? {}

    // 检查属性是否重复，为了避免出现无法调试的BUG，建议用户不要将同一个属性从不同地方多次传入
    const obj = mergeProps(_state, _ivkState, _cmpState)

    if (stateMerge && Object.keys(stateMerge).length) {
      for (const [key, fn] of Object.entries(stateMerge)) {
        if (!obj[key]) {
          console.warn(`[createHOC] ${key} 需要先声明`)
          continue
        }

        const val = fn(get(_state, key), get(_ivkState, key), get(_cmpState, key))
        set(obj, key, val)
      }
    }
    return obj as Partial<ExtractPropTypes<Props>>
  }
  const wrapperState = computed(resolveState)

  const _func: FunctionalComponent<Props> = (props, ctx) => {
    scope.run(() => {
      watchEffect(() => {
        cmpState.value = mergeProps({}, ctx.attrs, props as any)
      })
    })

    tryOnScopeDispose(scope.stop)

    return h(
      component as DefineComponent,
      {
        ...toValue(wrapperState),
        ref: (el) => { instance.value = el as any },
      },
      ctx.slots,
    )
  }

  function invoke(_state?: typeof state) {
    ivkState.value = toValue(_state)
  }

  tryOnScopeDispose(scope.stop)

  return {
    /** 被包裹的组件，它包裹的组件的状态不仅可以通过它的props进行“透传”，也可以通过`setState`方法进行传递，也可以通过配置options.state传递 */
    HOC: _func,

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
    ref: instance,
  }
}
