import { toValue } from '@vueuse/core'
import {
  type AppContext,
  type DefineComponent,
  type MaybeRefOrGetter,
  createCommentVNode,
  createVNode,
  getCurrentInstance,
  ref,
  render,
  shallowRef,
  watch,
} from 'vue'
import {} from '@vue/compiler-sfc'
import { createHOC, type createHOCOptions } from '../createHOC'
import { vModels } from '../_utils_'
import type { ComponentType } from '../types'

const UseDialogVisibleKeys = ['visible', 'show', 'modelValue', 'value'] as const

export interface UseDialogOptions<Com extends ComponentType, ComponentRef = unknown>
  extends createHOCOptions<Com, ComponentRef> {
  /**
   * 弹出双向绑定的key `<Dialog v-model:visible="bool"></Dialog>`
   * @default 'visible'
   * */
  visibleKey?: (typeof UseDialogVisibleKeys)[number];

  /**
   * 是否自动挂载组件，由于 vue不提供
   *
   * @default false
   * */
  auto?: boolean;

  /**
   * 当 `auto = true` 时，组件的挂载位置
   *
   * @default ()=>document.body
   */
  to?: MaybeRefOrGetter<HTMLElement>;

  /**
   * 当 `auto = true` 时，组件的显示状态，当你选择将组件自动挂载时，你可以通过这个属性控制
   *
   * @default true
   */
  display?: MaybeRefOrGetter<Boolean>;

  /**
   * 当 `auto = true` 时，由于自动挂载基于 `render` 函数实现， 因此需要将 createVNode 得到的 vnode 的appContext修复， 默认取 getCurrentInstance().appContext
   *
   * @default getCurrentInstance().appContext
   */
  appContext?: AppContext;
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
  slots,
  auto,
  to = () => document.body,
  display: initDisplay = true,
  appContext,
}: UseDialogOptions<Com, ComponentRef>) {
  const visible = ref(!!0)
  const display = ref(toValue(initDisplay))
  const dom = shallowRef<HTMLElement | null>(null)

  const vm = getCurrentInstance()

  const resolveState = () => ({
    ...toValue(state),
    ...vModels({
      [visibleKey]: visible,
    }),
  })

  const {
    HOC: DialogHOC,
    getState,
    setState: invoke,
    state: resolvedState,
    ref: resolvedInstRef,
    scope,
  } = createHOC<Com, ComponentRef>({
    component,
    state: resolveState,
    ref: instRef,
    stateMerge,
    slots,
  })

  const toggleDialogVisible = (_visible: boolean, _state?: typeof state) => {
    visible.value = _visible
    const state = () => toValue(_state) as any
    invoke(state)
  }

  const openDialog = (_state?: typeof state) => toggleDialogVisible(!!1, _state)
  const closeDialog = (_state?: typeof state) => toggleDialogVisible(!!0, _state)

  if (auto)
    setupAutoMount()

  function setupAutoMount() {
    const container = shallowRef<HTMLElement | DocumentFragment | null>(null)
    const vnode = shallowRef<ReturnType<typeof createVNode> | null>(null)

    scope.run(() => {
      watch(
        display,
        (val) => {
          if (val)
            _mount()
          else _desroy()
        },
        { immediate: !!1 },
      )
    })

    function _mount() {
      // create
      container.value = document.createDocumentFragment()
      vnode.value = createVNode(DialogHOC as DefineComponent)
      vnode.value.appContext = appContext || vm?.appContext || vnode.value.appContext
      render(vnode.value, container.value as unknown as HTMLElement)

      dom.value = vnode.value.el as HTMLElement
      // mount
      toValue(to).appendChild(container.value)
      display.value = !!1
    }

    function _desroy() {
      render(null, container.value as unknown as HTMLElement)
      container.value!.parentNode?.removeChild(container.value!)
      vnode.value?.component?.update()
      vnode.value = createCommentVNode('v-if', true)
      vnode.value?.component?.update()
      container.value = null
      display.value = !!0
    }
  }

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

    /**
     * 当 `auto = true` 时，弹窗组件的显示状态, 不同于visible, 这个状态是由组件自动挂载和卸载控制的，因此不建议你在不清楚作用的情况下修改这个状态
     */
    display,

    /**
     * 当 `auto = true` 时，弹窗组件的挂载位置
     */
    dom: dom,
  }
}
