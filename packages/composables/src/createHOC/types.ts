import { EffectScope, type MaybeRefOrGetter, type ShallowRef, type Slots } from 'vue-demi';
import type { ComponentType, GetComponentLooseProps } from '../types';

export interface CreateHOCOptions<Com extends ComponentType, ComponentRef = unknown> {
  /** 【必传】需要处理的组件 */
  component: Com;

  /**
   * Wrapper组件的组件名
   *
   * @default 'HOC'
   * */
  name?: string;

  ref?: ShallowRef<ComponentRef | null>;

  /**
   * @desc- 初始化的状态，其他状态请通过 `setState` 设置。
   */
  props?: MaybeRefOrGetter<GetComponentLooseProps<Com>>;

  /**
   * 代理插槽， 大部分情况下你都不应传入
   *
   * 当你尝试编写 usePopup 时， 也许你会希望自动挂载弹窗组件，这时候，你可以将插槽代理
   */
  slots?: MaybeRefOrGetter<Slots>;

  scope?: EffectScope;

  /**
   * 数据更新，假如高频更新请自行添加防抖、节流
   *  */
  onUpdate?: (data: GetComponentLooseProps<Com>) => any;
}
