import {
  type DefineComponent,
  type EmitsOptions,
  type WatchStopHandle,
  defineComponent,
  effectScope,
  h,
  mergeProps,
  shallowReactive,
  shallowReadonly,
  shallowRef,
  watchEffect,
} from 'vue-demi';
import { toValue, tryOnScopeDispose } from '@vueuse/core';
import { set } from 'lodash-es';
import { isUndef } from '@bluryar/shared';
import type { ComponentType, GetComponentEmits, GetComponentProps, GetComponentSlots } from '../types';
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
  type Props = Partial<GetComponentProps<Com>>;
  type Emits = GetComponentEmits<Com> & EmitsOptions;
  type Slots = GetComponentSlots<Com>;

  let {
    name = 'HOC',
    component,
    ref: componentRef = shallowRef(null),
    props,
    slots,
    scope = effectScope(!!1),
  } = options;
  const instance = shallowRef(componentRef);

  let mergedState = shallowReactive<Props>({});

  let stopWatch: WatchStopHandle | undefined;
  if (props) {
    stopWatch = watchEffect(() => {
      Object.assign(mergedState, toValue(props));
    });
  }

  const HOC = defineComponent({
    name,
    inheritAttrs: !!0,
    setup(_, ctx) {
      const attrs = ctx.attrs as Props;

      watchEffect(() => {
        const isUpdateByOutsideWatch = stopWatch && Object.keys(attrs).length;
        // 从函数中传入，因此不再允许从模板中更新
        if (isUpdateByOutsideWatch) {
          console.warn('[createHOC] props is not allowed to be updated. because it is passed from the function.');
          stopWatch?.();
          stopWatch = undefined;
          return;
        }

        attrs && Object.assign(mergedState, attrs);
      });

      const setRef = (el: any) => {
        instance.value = el;
      };

      return () =>
        h(
          component as DefineComponent,
          mergeProps(mergedState, {
            ref: setRef,
          }),
          {
            ...toValue(slots),
            ...ctx.slots,
          },
        );
    },
  });

  tryOnScopeDispose(stop);

  function stop() {
    scope.stop();

    stopWatch?.();
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
    return shallowReadonly(mergedState);
  }

  return {
    /** 被包裹的组件，它包裹的组件的状态不仅可以通过它的props进行“透传”，也可以通过`setState`方法进行传递，也可以通过配置options.state传递 */
    HOC: HOC as typeof component,

    /** 内部组件的实例 */
    ref: instance,

    /** 获取组件内部状态的只读代理对象 */
    getState,

    /** 设置属性, 两种写法, 传入一整个对象, 则便利这个对象的第一层赋值, 传入 `setState(k,v)` 则根据属性赋值 */
    setState,
  };
}
