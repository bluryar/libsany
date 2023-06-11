import {
  type DefineComponent,
  computed,
  createCommentVNode,
  createVNode,
  effectScope,
  getCurrentInstance,
  ref,
  render,
  shallowRef,
  unref,
  watch,
} from 'vue'

/* eslint-disable no-inner-declarations */
import { toValue } from '@vueuse/core'
import { isTrue, isUndef } from '@bluryar/shared'
import { get, omit } from 'lodash-es'
import { createHOC } from '../createHOC'
import { vModels } from '../_utils_'
import type { ComponentExternalProps, ComponentType } from '../types'

import type {
  UseDialogOptions,
  UseDialogOptionsAuto,
  UseDialogOptionsManual,
  UseDialogReturn,
  UseDialogReturnAuto,
  UseDialogReturnBase,
  UseDialogReturnManual,
} from './types'

export type {
  UseDialogOptions,
  UseDialogOptionsAuto,
  UseDialogOptionsManual,
  UseDialogReturn,
  UseDialogReturnAuto,
  UseDialogReturnManual,
}

// overload
export function useDialog<Com extends ComponentType, ComponentRef = unknown>(
  options: UseDialogOptionsAuto<Com, ComponentRef>,
): UseDialogReturnAuto<Com, ComponentRef>;

export function useDialog<Com extends ComponentType, ComponentRef = unknown>(
  options: UseDialogOptionsManual<Com, ComponentRef>,
): UseDialogReturnManual<Com, ComponentRef>;

// implement
export function useDialog<Com extends ComponentType, ComponentRef = unknown>(
  options: UseDialogOptions<Com, ComponentRef>,
): UseDialogReturn<Com, ComponentRef> {
  type Props = Partial<ComponentExternalProps<Com>>;

  const { auto = false, initState = () => ({}), visibleKey = 'visible' } = options

  const getInitVisible = () => get(toValue(initState) || {}, visibleKey) || false

  const visible = ref(getInitVisible())
  const scope = effectScope()

  const createHOCReturns = createHOC<Com, ComponentRef>(
    {
      ...options,
      initState: () =>
        ({
          ...toValue(initState),
          ...vModels({
            [visibleKey]: visible,
          }),
        } as any),
    },
    {
      scope,
    },
  )
  const { HOC: DialogHOC, setState, getState } = createHOCReturns
  const state = getState('readonly')

  const toggle = (_visible: boolean, ...args: unknown[]) => {
    setState(...(args as [any]))
    visible.value = _visible
  }
  const openDialog = (...args: any) => toggle(!!1, ...args)
  const closeDialog = (...args: any) => toggle(!!0, ...args)

  watch(visible, (v) => {
    setState(visibleKey, v)
  })

  watch(() => (state as any)[visibleKey], (v) => {
    visible.value = v
  })

  let returns: UseDialogReturnBase<Com, ComponentRef> = {
    ...omit(createHOCReturns, ['HOC', 'restoreState'] as const),

    restoreState,

    visible,

    openDialog,

    closeDialog,
  }

  /**
   * 重置组件状态
   *
   * @param _state - 传入一个函数，它会在每次调用 `restoreState` 时执行，它的返回值会被作为新的state
   */
  function restoreState(_state?: () => Props): void {
    visible.value = getInitVisible()

    createHOCReturns.restoreState(
      isUndef(_state)
        ? undefined
        : () => ({
          ...toValue(_state),
          ...vModels({
            [visibleKey]: visible,
          }),
        }),
    )
  }

  if (isTrue(auto)) {
    const vm = getCurrentInstance()
    const { appContext, to = () => document.body } = options as UseDialogOptionsAuto<Com, ComponentRef>
    const display = ref(true)
    const dom = shallowRef<HTMLElement | null>(null)

    const container = shallowRef<HTMLElement | DocumentFragment | null>(document.createDocumentFragment())
    const vnode = shallowRef<ReturnType<typeof createVNode> | null>(null)

    watch(
      display,
      (val) => {
        val ? _mount() : _destroy()
      },
      { immediate: !!1, flush: 'post' },
    )

    function _mount() {
      // create
      container.value = document.createDocumentFragment()
      vnode.value = createVNode(DialogHOC.value as DefineComponent)
      vnode.value.appContext = appContext || vm?.appContext || vnode.value.appContext
      render(vnode.value, container.value as unknown as HTMLElement)

      // mount
      dom.value = vnode.value.el as HTMLElement
      toValue(to).appendChild(container.value)
      display.value = !!1
    }

    function _destroy() {
      // unmount
      render(null, container.value as unknown as HTMLElement)
      container.value!.parentNode?.removeChild(container.value!)
      vnode.value?.component?.update()
      vnode.value = createCommentVNode('v-if', true)
      vnode.value?.component?.update()

      // update
      dom.value = vnode.value.el as HTMLElement
      container.value = document.createDocumentFragment()
      display.value = !!0
    }

    return {
      ...returns,

      destroy() {
        if (!display.value)
          return

        _destroy()
      },

      remount() {
        if (display.value)
          return
        _mount()
      },

      mounted: computed(() => !!unref(dom)),

      dom: dom,
    } as any
  }

  return {
    ...returns,

    Dialog: DialogHOC,
  } as any
}
