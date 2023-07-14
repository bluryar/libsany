import { EffectScope, type ShallowReactive, type ShallowRef, type Slots } from 'vue-demi';
import type { ComponentType, GetComponentLooseProps } from '../types';

export interface CreateHOCOptions<Com extends ComponentType, ComponentRef = unknown> {
  /** 【必传】需要处理的组件 */
  component: Com;

  ref?: ShallowRef<ComponentRef | null>;

  /**
   * @desc- 初始化的状态，其他状态请通过 `setState` 设置。
   */
  props?: ShallowReactive<GetComponentLooseProps<Com>>;

  /**
   * 代理插槽， 大部分情况下你都不应传入
   *
   * 当你尝试编写 usePopup 时， 也许你会希望自动挂载弹窗组件，这时候，你可以将插槽代理
   */
  slots?: Slots;
}

export interface CreateHOCDevOptions<Com extends ComponentType> {
  /** 谨慎传递，除非你知晓作用 */
  scope?: EffectScope;

  /**
   * 当发生 props 冲突时，会调用这个函数， 你可以在此打印它们的值
   * @param composablesProps 通过 hook 的 props 参数传入的值
   * @param componentProps 通过组件模板传入的值
   */
  onConflictProps?: <Key extends keyof GetComponentLooseProps<Com>>(
    composablesProps: { key: Key; val: GetComponentLooseProps<Com>[Key] }[],
    componentProps: { key: Key; val: GetComponentLooseProps<Com>[Key] }[],
  ) => void;
}
