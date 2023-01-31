import { type MaybeComputedRef, resolveUnref } from '@vueuse/shared'
import { ref } from 'vue-demi'
import type { DefineComponent, ExtractPropTypes } from 'vue-demi'
import { useComponentWrapper } from '../useComponentWrapper'
import { vModels } from '../_utils_'

const UseDialogVisibleKeys = ['visible', 'show', 'modelValue', 'value'] as const

/**
 * @todo provide/inject注入配置
 */
export interface UseDialogOptions<Props extends Record<string, any>> {
  /** 【必传】需要处理的组件 */
  component: DefineComponent<Props, any, any>

  /** 弹窗的props，一般用于定义一些在非动态获取的props，比如非接口返回值 */
  state?: MaybeComputedRef<Partial<ExtractPropTypes<Props>> & { [key: string]: any }>

  /**
   * 弹出双向绑定的key `<Dialog v-model:visible="bool"></Dialog>`
   * @default 'visible'
   * */
  visibleKey?: typeof UseDialogVisibleKeys[number]
}

/**
 * @desc - 快速创建弹窗组件, 一般打开弹窗重复的传递一些中间状态, 比如 `visible` 或者其他一些接口返回的业务数据需要传入给弹窗组件.
 *
 * **注意**：为了保证组件整体的可读性和完整性，你仍然需要手动将返回的组件放置在模板中，弹窗组件的存在只能在`<script>`中看到。
 *
 * ---
 *
 * 注意:
 * - 弹窗组件 -- 二次封装组件库的 `<Dialog> | <Modal>` 组件
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
export const useDialog = <Props extends Record<string, any>>(
  {
    component,
    state = () => ({}),
    visibleKey = 'visible',
  }: UseDialogOptions<Props>,
) => {
  const visible = ref(!!0)

  const resolveState = () => ({
    ...resolveUnref(state),
    ...vModels({
      [visibleKey]: visible,
    }),
  })

  const { Wrapper, getState, setState: invoke, state: wrapperState } = useComponentWrapper({
    component,
    state: resolveState,
  })

  const toggleDialogVisible = (_visible: boolean, _state?: typeof state) => {
    visible.value = _visible
    const state = () => resolveUnref(_state) as any
    invoke(state)
  }

  const openDialog = (_state?: typeof state) => toggleDialogVisible(!!1, _state)
  const closeDialog = (_state?: typeof state) => toggleDialogVisible(!!0, _state)

  return {
    /**
     * 弹窗组件的代理组件
     */
    Dialog: Wrapper,

    /**
     * 弹窗的可见性
     */
    visible,

    /**
     * 【计算属性】弹窗组件原本的props
     */
    state: wrapperState,

    /**
     * 获取弹窗的props，合并顺序：组件props > setState > useDialog({state})
     */
    getState,

    /**
     * 设置组件的props，注意props的合并顺序
     */
    setState: invoke,

    /** 打开弹窗， 可以同时调用`setState` */
    openDialog,

    /** 关闭弹窗， 可以同时调用`setState` */
    closeDialog,
  }
}
