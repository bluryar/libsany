import { toValue } from '@vueuse/core'
import { ref, shallowRef } from 'vue'
import {} from '@vue/compiler-sfc'
import { createHOC, type createHOCOptions } from '../createHOC'
import { vModels } from '../_utils_'
import type { ComponentType } from '../types'

const UseDialogVisibleKeys = ['visible', 'show', 'modelValue', 'value'] as const

export interface UseDialogOptions<Com extends ComponentType, ComponentRef = unknown> extends createHOCOptions<Com, ComponentRef>{
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
 * 理论上，任意接收一个双向绑定的布尔值props的组件都可以看作弹窗组件。比如 naive-ui 的抽屉组件 `<NDrawer />`
 *
 * ---
 *
 * 定义:
 * - 弹窗组件 -- 二次封装组件库的 `<Dialog> | <Modal>` 组件
 */
export function useDialog<Com extends ComponentType, ComponentRef = unknown>({
  component,
  state = () => ({}),
  visibleKey = 'visible',
  ref: instRef = shallowRef(null),
  stateMerge = undefined,
}: UseDialogOptions<Com, ComponentRef>) {
  const visible = ref(!!0)

  const resolveState = () => ({
    ...toValue(state),
    ...vModels({
      [visibleKey]: visible,
    }),
  })

  const { HOC: DialogHOC, getState, setState: invoke, state: resolvedState, ref: resolvedInstRef } = createHOC<Com, ComponentRef>({
    component,
    state: resolveState,
    ref: instRef,
    stateMerge,
  })

  const toggleDialogVisible = (_visible: boolean, _state?: typeof state) => {
    visible.value = _visible
    const state = () => toValue(_state) as any
    invoke(state)
  }

  const openDialog = (_state?: typeof state) => toggleDialogVisible(!!1, _state)
  const closeDialog = (_state?: typeof state) => toggleDialogVisible(!!0, _state)

  return {
    /**
     * 弹窗组件的代理组件
     */
    Dialog: DialogHOC,

    /**
     * 弹窗的可见性
     */
    visible,

    /**
     * 【计算属性】弹窗组件原本的props (只读属性副本)
     */
    state: resolvedState,

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

    /** 传入的组件的ref，你可以手动传入，也可以由hook创建 */
    ref: resolvedInstRef,
  }
}
