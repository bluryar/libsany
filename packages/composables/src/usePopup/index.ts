import { effectScope, mergeProps, ref, watch } from 'vue-demi';

import { toValue } from '@vueuse/core';
import { isTrue, isUndef } from '@bluryar/shared';
import { get, omit, pick } from 'lodash-es';
import { createHOC } from '../createHOC';
import { vModels } from '../_utils_';
import type { ComponentType, GetComponentLooseProps } from '../types';
import { useAutoMount } from '../useAutoMount';

import type {
  UsePopupOptions,
  UsePopupOptionsAuto,
  UsePopupOptionsManual,
  UsePopupReturn,
  UsePopupReturnAuto,
  UsePopupReturnBase,
  UsePopupReturnManual,
} from './types';

export type {
  UsePopupOptions,
  UsePopupOptionsAuto,
  UsePopupOptionsManual,
  UsePopupReturn,
  UsePopupReturnAuto,
  UsePopupReturnManual,
};

// overload
export function usePopup<Com extends ComponentType, ComponentRef = unknown>(
  options: UsePopupOptionsAuto<Com, ComponentRef>,
): UsePopupReturnAuto<Com, ComponentRef>;

export function usePopup<Com extends ComponentType, ComponentRef = unknown>(
  options: UsePopupOptionsManual<Com, ComponentRef>,
): UsePopupReturnManual<Com, ComponentRef>;

// implement
export function usePopup<Com extends ComponentType, ComponentRef = unknown>(
  options: UsePopupOptions<Com, ComponentRef>,
): UsePopupReturn<Com, ComponentRef> {
  type Props = GetComponentLooseProps<Com>;

  const { auto = false, props: initState = {}, visibleKey = 'visible' } = options;

  const getInitVisible = (state: Props = initState) => get(toValue(state) || {}, visibleKey) || false;

  const visible = ref(getInitVisible(initState));
  const scope = effectScope();

  const createHOCReturns = createHOC<Com, ComponentRef>({
    ...options,
    scope,
    props: getInitProps(initState),
  });
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
  const state = getState();
  watch(
    () => (state as any)[visibleKey],
    (v) => {
      visible.value = v;
    },
    { immediate: !!1 },
  );

  // 构造共有返回值
  let returns: UsePopupReturnBase<Com, ComponentRef> = {
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
    const parReturns = useAutoMount({
      component: DialogHOC,
      ...pick(options as UsePopupOptionsAuto<Com, ComponentRef>, ['to', 'appContext', 'vIf', 'scope'] as const),
    });

    return {
      ...returns,
      ...parReturns,
    } as any;
  }

  return {
    ...returns,

    Dialog: DialogHOC,
  } as any;
}
