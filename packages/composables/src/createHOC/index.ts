import { nextTick } from 'node:process'
import { type DefineComponent, createVNode, defineComponent, effectScope, shallowRef } from 'vue'
import { tryOnScopeDispose } from '@vueuse/core'
import type { ComponentExternalProps, ComponentType } from '../types'
import type { CreateHOCDevOptions, CreateHOCOptions } from './types'

export type { CreateHOCDevOptions, CreateHOCOptions }

/**
 * @desc - 使用 `defineComponent` 创建一个高阶组件，它可以对被包裹的组件进行状态管理，因为实际传递给 `options.component` 的 props 时有这个hook维护的。
 */
export function createHOC<Com extends ComponentType, ComponentRef = unknown>(
  options: CreateHOCOptions<Com, ComponentRef>,
  devOptions?: CreateHOCDevOptions,
) {
  const { component, ref = shallowRef(null), initState = {}, slots } = options
  const { scope = effectScope() } = devOptions || {}
  type Props = ComponentExternalProps<typeof component>;

  const mergedState = shallowRef<Partial<Props>>(initState)
  const Empty = () => null
  const componentRef = shallowRef<typeof Empty | Com>(Empty)
  const instance = shallowRef(ref)

  componentRef.value = createComponent()

  tryOnScopeDispose(stop)

  function stop() {
    scope.stop()

    nextTick(() => {
      mergedState.value = initState
      componentRef.value = Empty
      instance.value = null
    })
  }

  function createComponent() {
    return defineComponent({
      name: 'HOC',
      inheritAttrs: !!0,
      setup(_, ctx) {
        const setInst = (el: any) => {
          instance.value = el
        }

        const getSlots = () => ({
          ...slots,
          ...ctx.slots,
        })

        tryOnScopeDispose(stop)

        return () =>
          createVNode(
            component as DefineComponent,
            {
              ...mergedState.value,
              ref: setInst,
            },
            getSlots(),
          )
      },
    }) as typeof component
  }

  return {
    /** 被包裹的组件，它包裹的组件的状态不仅可以通过它的props进行“透传”，也可以通过`setState`方法进行传递，也可以通过配置options.state传递 */
    HOC: componentRef,

    /**
     * - 依赖于`getState`创建的只读属性副本
     */
    state: mergedState,

    /** 内部组件的实例 */
    ref: instance,
  }
}
