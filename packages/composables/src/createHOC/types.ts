import { EffectScope, type ShallowRef, type Slots } from 'vue'
import type { ComponentExternalProps, ComponentType } from '../types'

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface CreateHOCOptions<Com extends ComponentType, ComponentRef = unknown> {
  /** 【必传】需要处理的组件 */
  component: Com;

  ref?: ShallowRef<ComponentRef | null>;

  /**
   * 组件的props，被代理的组件的props可以通过三种方式修改
   *
   * 注意：此处存在合并策略，函数返回的Wrapper组件的props优先级最高，这里设置的state优先级最低
   */
  initState?: () => Partial<Prettify<ComponentExternalProps<Com>>>;

  /**
   * 代理插槽， 大部分情况下你都不应传入
   *
   * 当你尝试编写 useDialog 时， 也许你会希望自动挂载弹窗组件，这时候，你可以将插槽代理
   */
  slots?: Slots;
}

export interface CreateHOCDevOptions {
  /** 谨慎传递，除非你知晓作用 */
  scope?: EffectScope;
}
