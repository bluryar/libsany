import { type AppContext, EffectScope, type MaybeRef, type MaybeRefOrGetter } from 'vue-demi';
import type { ComponentType } from '../types';

export interface UseSetupRenderOptions<Com extends ComponentType> {
  component: Com;

  /**
   * 挂载到的 DOM 元素或返回 DOM 元素的函数
   *
   * @default () => document.body
   */
  to?: MaybeRefOrGetter<HTMLElement>;

  /**
   * appContext 对象
   */
  appContext?: MaybeRefOrGetter<AppContext>;

  /**
   *
   * @default true
   */
  vIf?: MaybeRef<boolean>;

  scope?: EffectScope;
}
