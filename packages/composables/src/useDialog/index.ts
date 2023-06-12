import {
  type DefineComponent,
  computed,
  createCommentVNode,
  createVNode,
  effectScope,
  getCurrentInstance,
  mergeProps,
  ref,
  render,
  shallowRef,
  unref,
  watch,
} from 'vue';

/* eslint-disable no-inner-declarations */
import { toValue } from '@vueuse/core';
import { isTrue, isUndef } from '@bluryar/shared';
import { get, omit } from 'lodash-es';
import { createHOC } from '../createHOC';
import { vModels } from '../_utils_';
import type { ComponentType, GetComponentLooseProps } from '../types';

import type {
  UseDialogOptions,
  UseDialogOptionsAuto,
  UseDialogOptionsManual,
  UseDialogReturn,
  UseDialogReturnAuto,
  UseDialogReturnBase,
  UseDialogReturnManual,
} from './types';

export type {
  UseDialogOptions,
  UseDialogOptionsAuto,
  UseDialogOptionsManual,
  UseDialogReturn,
  UseDialogReturnAuto,
  UseDialogReturnManual,
};

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
  type Props = GetComponentLooseProps<Com>;

  const { auto = false, props: initState = {}, visibleKey = 'visible' } = options;

  const getInitVisible = (state: Props = initState) => get(toValue(state) || {}, visibleKey) || false;

  const visible = ref(getInitVisible(initState));
  const scope = effectScope();

  const createHOCReturns = createHOC<Com, ComponentRef>(
    {
      ...options,
      props: getInitProps(initState),
    },
    {
      scope,
    },
  );
  const { HOC: DialogHOC, setState, getState } = createHOCReturns;

  // 开关弹窗
  const toggle = (_visible: boolean, ...args: unknown[]) => {
    setState(...(args as [any]));
    visible.value = _visible;
  };
  const openDialog = (...args: any) => toggle(!!1, ...args);
  const closeDialog = (...args: any) => toggle(!!0, ...args);

  // 同步visible和state['visible']
  watch(
    visible,
    (v) => {
      setState(visibleKey, v);
    },
    { immediate: !!1 },
  );
  const state = getState('shallowReadonly');
  watch(
    () => (state as any)[visibleKey],
    (v) => {
      visible.value = v;
    },
    { immediate: !!1 },
  );

  // 构造共有返回值
  let returns: UseDialogReturnBase<Com, ComponentRef> = {
    ...omit(createHOCReturns, ['HOC', 'restoreState'] as const),

    restoreState,

    visible,

    openDialog,

    closeDialog,
  };

  // 返回初始props，弹窗需要在卸载时完成某些重置状态的步骤
  function getInitProps(state: Props): GetComponentLooseProps<Com> | undefined {
    return mergeProps(
      state,
      vModels({
        [visibleKey]: visible,
      }),
      {
        onVnodeUnmounted() {
          restoreState();
        },
      } as any,
    ) as Props;
  }

  /**
   * 重置组件状态
   *
   * @param _state - 传入一个函数，它会在每次调用 `restoreState` 时执行，它的返回值会被作为新的state
   */
  function restoreState(_state?: Props): void {
    visible.value = getInitVisible(_state || initState);

    createHOCReturns.restoreState(isUndef(_state) ? undefined : getInitProps(_state));
  }

  if (isTrue(auto)) {
    const vm = getCurrentInstance();
    const { appContext, to = () => document.body } = options as UseDialogOptionsAuto<Com, ComponentRef>;
    const display = ref(true);
    const dom = shallowRef<HTMLElement | null>(null);

    const container = shallowRef<HTMLElement | DocumentFragment | null>(document.createDocumentFragment());
    const vnode = shallowRef<ReturnType<typeof createVNode> | null>(null);

    watch(
      display,
      (val) => {
        val ? _mount() : _destroy();
      },
      { immediate: !!1, flush: 'post' },
    );

    function _mount() {
      // create
      container.value = document.createDocumentFragment();
      vnode.value = createVNode(DialogHOC.value as DefineComponent);
      vnode.value.appContext = appContext || vm?.appContext || vnode.value.appContext;
      render(vnode.value, container.value as unknown as HTMLElement);

      // mount
      dom.value = vnode.value.el as HTMLElement;
      toValue(to).appendChild(container.value);
      display.value = !!1;
    }

    function _destroy() {
      // unmount
      render(null, container.value as unknown as HTMLElement);
      container.value!.parentNode?.removeChild(container.value!);
      vnode.value?.component?.update();
      vnode.value = createCommentVNode('v-if', true);
      vnode.value?.component?.update();

      // update
      dom.value = vnode.value.el as HTMLElement;
      container.value = document.createDocumentFragment();
      display.value = !!0;
    }

    return {
      ...returns,

      destroy() {
        if (!display.value) return;

        _destroy();
      },

      remount() {
        if (display.value) return;

        _mount();
      },

      mounted: computed(() => !!unref(dom)),

      dom: dom,
    } as any;
  }

  return {
    ...returns,

    Dialog: DialogHOC,
  } as any;
}
