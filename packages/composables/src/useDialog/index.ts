import { unref } from 'vue'

/* eslint-disable no-inner-declarations */
import { toValue } from '@vueuse/core'
import {
  type DefineComponent,
  computed,
  createCommentVNode,
  createVNode,
  getCurrentInstance,
  ref,
  render,
  shallowRef,
  watch,
} from 'vue'
import { isTrue } from '@bluryar/shared'
import { omit } from 'lodash-es'
import { createHOC } from '../createHOC'
import { vModels } from '../_utils_'
import type { ComponentType } from '../types'

import type {
  UseDialogOptions,
  UseDialogOptionsAuto,
  UseDialogOptionsManual,
  UseDialogReturn,
  UseDialogReturnAuto,
  UseDialogReturnManual,
} from './types'

export type {
  UseDialogOptions,
  UseDialogOptionsAuto,
  UseDialogOptionsManual,
  UseDialogReturn,
  UseDialogReturnAuto,
  UseDialogReturnManual,
} from './types'

export function useDialog<Com extends ComponentType, ComponentRef = unknown>(
  options: UseDialogOptionsAuto<Com, ComponentRef>,
): UseDialogReturnAuto<Com, ComponentRef>;

export function useDialog<Com extends ComponentType, ComponentRef = unknown>(
  options: UseDialogOptionsManual<Com, ComponentRef>,
): UseDialogReturnManual<Com, ComponentRef>;

export function useDialog<Com extends ComponentType, ComponentRef = unknown>(
  options: UseDialogOptions<Com, ComponentRef>,
): UseDialogReturn<Com, ComponentRef> {
  const { auto = false, state: defaultState, visibleKey = 'visible' } = options

  const visible = ref(!!0)
  const vm = getCurrentInstance()

  const resolveState = () => ({
    ...toValue(defaultState),
    ...vModels({
      [visibleKey]: visible,
    }),
  })

  const createHOCReturns = createHOC<Com, ComponentRef>({
    ...options,
    state: resolveState as any,
  })
  const { HOC: DialogHOC, setState: invoke, scope } = createHOCReturns

  const toggleDialogVisible = (_visible: boolean, _state?: typeof defaultState) => {
    visible.value = _visible
    const state = () => toValue(_state) as any
    invoke(state)
  }

  const openDialog = (_state?: typeof defaultState) => toggleDialogVisible(!!1, _state)
  const closeDialog = (_state?: typeof defaultState) => toggleDialogVisible(!!0, _state)

  if (isTrue(auto)) {
    const { appContext, to = () => document.body } = options as UseDialogOptionsAuto<Com, ComponentRef>
    const display = ref(true)
    const dom = shallowRef<HTMLElement | null>(null)

    const container = shallowRef<HTMLElement | DocumentFragment | null>(document.createDocumentFragment())
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

      // mount
      dom.value = vnode.value.el as HTMLElement
      toValue(to).appendChild(container.value)
      display.value = !!1
    }

    function _desroy() {
      // unmount
      render(null, container.value as unknown as HTMLElement)
      container.value!.parentNode?.removeChild(container.value!)
      vnode.value?.component?.update()
      vnode.value = createCommentVNode('v-if', true)
      vnode.value?.component?.update()

      // update
      dom.value = vnode.value.el as HTMLElement
      container.value = null
      display.value = !!0
    }

    return {
      ...omit(createHOCReturns, ['HOC', 'scope']),

      visible,

      openDialog,

      closeDialog,

      destroy() {
        display.value = !!0
      },

      mounted: computed(() => !!unref(display)),

      dom: dom,
    } as any
  }

  return {
    ...omit(createHOCReturns, ['HOC', 'scope']),

    Dialog: DialogHOC,

    visible,

    openDialog,

    closeDialog,
  } as any
}
