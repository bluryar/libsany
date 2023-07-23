import type { ComputedRef, Ref } from 'vue-demi';
import type { useAutoMount } from '../useAutoMount';
import { createHOC } from '../createHOC';
import type { CreateHOCOptions } from '../createHOC/types';
import type { ComponentExternalProps, ComponentType } from '../types';

const UsePopupVisibleKeys = ['visible', 'show', 'modelValue', 'value'] as const;
type UsePopupVisibleKey = (typeof UsePopupVisibleKeys)[number];
interface UsePopupOptionsBase<Com extends ComponentType, ComponentRef = unknown>
  extends CreateHOCOptions<Com, ComponentRef> {
  /**
   * 弹出双向绑定的key `<Dialog v-model:visible="bool"></Dialog>`
   * @default 'visible'
   * */
  visibleKey?: UsePopupVisibleKey;
}
export interface UsePopupOptionsAuto<Com extends ComponentType, ComponentRef = unknown>
  extends UsePopupOptionsBase<Com, ComponentRef>,
    Omit<NonNullable<Parameters<typeof useAutoMount>[0]>, 'component'> {
  /**
   * 是否自动挂载组件，由于 vue 不提供获取injectionKey的缘故, 建议当你需要使用外部注入的内容时, 设置为false
   */
  auto: true;
}

export interface UsePopupOptionsManual<Com extends ComponentType, ComponentRef = unknown>
  extends UsePopupOptionsBase<Com, ComponentRef> {
  /**
   * 是否自动挂载组件，由于 vue 不提供获取injectionKey的缘故, 建议当你需要使用外部注入的内容时, 设置为false
   */
  auto?: false;
}

export type UsePopupOptions<Com extends ComponentType, ComponentRef = unknown> =
  | UsePopupOptionsAuto<Com, ComponentRef>
  | UsePopupOptionsManual<Com, ComponentRef>;

export interface SetState<Com extends ComponentType> {
  <Key extends string>(key: Key, value: unknown): void;
  <Key extends keyof Partial<ComponentExternalProps<Com>>>(
    key: Key,
    value: Partial<ComponentExternalProps<Com>>[Key],
  ): void;
  (state?: Partial<ComponentExternalProps<Com>>): void;
}

export interface UsePopupReturnBase<Com extends ComponentType, ComponentRef = unknown>
  extends Omit<ReturnType<typeof createHOC<Com, ComponentRef>>, 'HOC'> {
  /**
   * 是否显示组件
   */
  visible: Ref<boolean>;

  /**
   * 打开弹窗
   */
  open: SetState<Com>;

  /**
   * 关闭弹窗
   */
  close: SetState<Com>;
}

export interface UsePopupReturnAuto<Com extends ComponentType, ComponentRef = unknown>
  extends UsePopupReturnBase<Com, ComponentRef>,
    NonNullable<ReturnType<typeof useAutoMount>> {
  /** 组件是否挂载完毕 */
  mounted: ComputedRef<boolean>;
}

export interface UsePopupReturnManual<Com extends ComponentType, ComponentRef = unknown>
  extends UsePopupReturnBase<Com, ComponentRef> {
  /**
   * 弹窗组件
   */
  Popup: ReturnType<typeof createHOC<Com, ComponentRef>>['HOC'];
}

export type UsePopupReturn<Com extends ComponentType, ComponentRef = unknown> = UsePopupReturnAuto<Com, ComponentRef> &
  UsePopupReturnManual<Com, ComponentRef>;
