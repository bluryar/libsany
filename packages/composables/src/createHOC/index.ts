import {
  type DefineComponent,
  type EmitsOptions,
  type FunctionalComponent,
  effectScope,
  h,
  mergeProps,
  nextTick,
  readonly,
  ref,
  shallowReactive,
  shallowRef,
  watch,
} from 'vue-demi';
import { toValue, tryOnScopeDispose } from '@vueuse/core';
import { cloneDeep, set } from 'lodash-es';
import { isUndef } from '@bluryar/shared';
import type { ComponentType, GetComponentEmits, GetComponentLooseProps, GetComponentSlots } from '../types';
import type { CreateHOCOptions } from './types';

export type { CreateHOCOptions };

/**
 * @desc - 使用 `defineComponent` 创建一个高阶组件，它可以对被包裹的组件进行状态管
 *
 * 因为实际传递给 `options.component` 的 props 时有这个hook维护的。
 *
 * 注意: 内部传入的state是deeply reactive的, 假如你的某些属性是希望非响应式的，你可以使用 `shallowReadonly` 或 `markRaw` 包裹这个属性, 阻断属性的响应式
 */
export function createHOC<Com extends ComponentType, ComponentRef = unknown>(
  options: CreateHOCOptions<Com, ComponentRef>,
) {
  // Shorthand
  type Props = GetComponentLooseProps<Com>;
  type Emits = GetComponentEmits<Com> & EmitsOptions;
  type Slots = GetComponentSlots<Com>;

  let {
    component,
    ref: componentRef = shallowRef(null),
    props = ref({} satisfies Props),
    slots,
    scope = effectScope(!!1),
  } = options;
  const instance = shallowRef(componentRef);

  let mergedState = shallowReactive<Props>(cloneDeep(toValue(props)));

  watch(
    () => toValue(props),
    (_props) => {
      Object.assign(mergedState, _props);
    },
    { deep: !!1 },
  );

  const HOC: FunctionalComponent<Props, Emits, Slots> = (_, ctx) => {
    const hasLength = !!Object.keys(ctx.attrs).length;
    if (hasLength) Object.assign(mergedState, ctx.attrs);

    const _props = mergeProps(mergedState, {
      ref: (el: any) => {
        instance.value = el;
      },
    });

    return h(component as DefineComponent, _props, {
      ...toValue(slots),
      ...ctx.slots,
    });
  };

  HOC.inheritAttrs = !!0;

  tryOnScopeDispose(stop);

  function stop() {
    scope.stop();

    nextTick(() => {
      instance.value = null;
    });
  }

  // overload
  function setState<Key extends keyof Props>(key: Key, val: Props[Key]): void;
  function setState<Key extends string>(key: Key, val: unknown): void;
  function setState(_state: Props): void;

  // implementation
  function setState(...args: any[]): void {
    if (!args?.length) return;

    if (args.length === 1) {
      if (isUndef(args[0])) return;

      for (const [k, v] of Object.entries(args[0])) set(mergedState, k, v);
    } else if (args.length === 2) {
      set(mergedState, args[0], args[1]);
    }
  }

  /**
   * 获取只读代理对象
   *
   */
  function getState() {
    return readonly(mergedState);
  }

  return {
    /** 被包裹的组件，它包裹的组件的状态不仅可以通过它的props进行“透传”，也可以通过`setState`方法进行传递，也可以通过配置options.state传递 */
    HOC,

    /** 内部组件的实例 */
    ref: instance,

    /** 获取组件内部状态的只读代理对象 */
    getState,

    /** 设置属性, 两种写法, 传入一整个对象, 则便利这个对象的第一层赋值, 传入 `setState(k,v)` 则根据属性赋值 */
    setState,
  };
}
