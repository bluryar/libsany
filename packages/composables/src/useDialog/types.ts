import type { ComputedRef, Ref, ShallowRef } from 'vue-demi';
import { createHOC } from '../createHOC';
import type { CreateHOCOptions } from '../createHOC/types';
import type { ComponentExternalProps, ComponentType } from '../types';

const UseDialogVisibleKeys = ['visible', 'show', 'modelValue', 'value'] as const;
type UseDialogVisibleKey = (typeof UseDialogVisibleKeys)[number];
interface UseDialogOptionsBase<Com extends ComponentType, ComponentRef = unknown>
  extends CreateHOCOptions<Com, ComponentRef> {
  /**
   * 弹出双向绑定的key `<Dialog v-model:visible="bool"></Dialog>`
   * @default 'visible'
   * */
  visibleKey?: UseDialogVisibleKey;
}
export interface UseDialogOptionsAuto<Com extends ComponentType, ComponentRef = unknown>
  extends UseDialogOptionsBase<Com, ComponentRef> {
  /**
   * 是否自动挂载组件，由于 vue 不提供获取injectionKey的缘故, 建议当你需要使用外部注入的内容时, 设置为false
   */
  auto: true;
  /**
   * 挂载到的 DOM 元素或返回 DOM 元素的函数
   */
  to?: HTMLElement | (() => HTMLElement);

  /**
   * appContext 对象
   */
  appContext?: any;
}
export interface UseDialogOptionsManual<Com extends ComponentType, ComponentRef = unknown>
  extends UseDialogOptionsBase<Com, ComponentRef> {
  /**
   * 是否自动挂载组件，由于 vue 不提供获取injectionKey的缘故, 建议当你需要使用外部注入的内容时, 设置为false
   */
  auto?: false;
}
export type UseDialogOptions<Com extends ComponentType, ComponentRef = unknown> =
  | UseDialogOptionsAuto<Com, ComponentRef>
  | UseDialogOptionsManual<Com, ComponentRef>;

export interface SetState<Com extends ComponentType> {
  <Key extends string>(key: Key, value: unknown): void;
  <Key extends keyof Partial<ComponentExternalProps<Com>>>(
    key: Key,
    value: Partial<ComponentExternalProps<Com>>[Key],
  ): void;
  (state?: Partial<ComponentExternalProps<Com>>): void;
}

export interface UseDialogReturnBase<Com extends ComponentType, ComponentRef = unknown>
  extends Omit<ReturnType<typeof createHOC<Com, ComponentRef>>, 'HOC'> {
  /**
   * 是否显示组件
   */
  visible: Ref<boolean>;

  /**
   * 打开弹窗
   */
  openDialog: SetState<Com>;

  /**
   * 关闭弹窗
   */
  closeDialog: SetState<Com>;
}
export interface UseDialogReturnAuto<Com extends ComponentType, ComponentRef = unknown>
  extends UseDialogReturnBase<Com, ComponentRef> {
  /** 组件是否挂载完毕 */
  mounted: ComputedRef<boolean>;

  /**
   * 销毁组件
   */
  destroy: () => void;

  /**
   * 重新挂载组件
   */
  remount: () => void;

  /**
   * 组件的 DOM 元素
   */
  dom: ShallowRef<HTMLElement | null>;
}
export interface UseDialogReturnManual<Com extends ComponentType, ComponentRef = unknown>
  extends UseDialogReturnBase<Com, ComponentRef> {
  /**
   * 弹窗组件
   */
  Dialog: ReturnType<typeof createHOC<Com, ComponentRef>>['HOC'];
}
export type UseDialogReturn<Com extends ComponentType, ComponentRef = unknown> = UseDialogReturnAuto<
  Com,
  ComponentRef
> &
  UseDialogReturnManual<Com, ComponentRef>;
