import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { ref } from 'vue'
import { isUndefined } from 'lodash-es'
import type { UseComponentWrapperOptions } from '../useComponentWrapper'
import { useComponentWrapper } from '../useComponentWrapper'

interface UseDialogOptions<Props extends Record<string, any>> extends UseComponentWrapperOptions<Props> {
  /**
   * 弹出双向绑定的key `<Dialog v-model:visible="bool"></Dialog>`
   * @default 'visible'
   * */
  visibleKey?: 'visible' | 'show' | 'modelValue' | 'value'
}

type UseDialogReturn<Props extends Record<string, any>> = typeof useDialog<Props>

/**
 * @desc - 快速创建弹窗组件, 一般打开弹窗重复的传递一些中间状态, 比如 `visible` 或者其他一些接口返回的业务数据需要传入给弹窗组件.
 *
 * ---
 *
 * 注意:
 * - 弹窗组件 - 二次封装组件库的`<Dialog>`\`<Modal>`组件
 *
 * ---
 *
 * @example
 * ```tsx
 * import { defineComponent } from 'vue'
 * import SyncComponent from 'path/to/SyncComponent.vue'
 * import { useDialog } from '@bluryar/composables'
 * import { Modal } from 'ant-design-vue'
 * import { useVModel } from '@vueuse/core'
 *
 * const { Dialog: InternalDialog, openDialog, closeDialog } = useDialog({ component: defineComponent({
 *   name: 'InternalDialog',
 *   props: {
 *     visible: { type: Boolean, default: !!0 },
 *     foo: { type: Number, default: 0 }
 *   },
 *   setup(props) {
 *     const visible = useVModel(props, 'visible', undefined, { passive:!!1 })
 *     return () => (<Dialog v-model:visible="visible.value">{prop.foo}</Dialog>)
 *   }
 * }) })
 * const { Dialog: SyncComponentDialog } = useDialog({ component: SyncComponent })
 * const { Dialog: AsyncComponentDialog } = useDialog({
 *   component: defineAsyncComponent(() => import('path/to/AsyncComponent.vue'))
 * })
 *
 * const num = ref(10)
 *
 * openDialog(() => ({
 *   foo: num.value
 * }))
 *
 * closeDialog()
 * ```
 */
const useDialog = <Props extends Record<string, any>>(
  {
    component,
    state = () => ({}),
    visibleKey = 'visible',
  }: UseDialogOptions<Props>,
) => {
  const visible = ref(!!0)

  const resolveState = () => ({
    ...resolveUnref(state),
    [visibleKey]: visible.value,
    [`onUpdate:${visibleKey}`]: (val: boolean) => visible.value = val,
  })

  const { Wrapper, getState, invoke } = useComponentWrapper({
    component,
    state: resolveState,
  })

  const openDialog = (state: MaybeComputedRef<Partial<Props>> = () => ({})) => {
    visible.value = !!1
    if (!isUndefined(state))
      invoke(() => resolveUnref(state))
  }

  const closeDialog = (state: MaybeComputedRef<Partial<Props>> = () => ({})) => {
    visible.value = !!0
    if (!isUndefined(state))
      invoke(() => resolveUnref(state))
  }

  return {
    Dialog: Wrapper,
    visible,
    getState,
    invoke,
    openDialog,
    closeDialog,
  }
}

export type { UseDialogOptions, UseDialogReturn }
export { useDialog }
