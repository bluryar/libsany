import {
  type DefineComponent,
  defineComponent,
  effectScope,
  h,
  mergeProps,
  nextTick,
  reactive,
  readonly,
  shallowReadonly,
  shallowRef,
  unref,
  watch,
} from 'vue-demi';
import { toValue, tryOnScopeDispose } from '@vueuse/core';
import { cloneDeep, set } from 'lodash-es';
import { isUndef } from '@bluryar/shared';
import type { ComponentType, GetComponentLooseProps } from '../types';
import type { CreateHOCDevOptions, CreateHOCOptions } from './types';

export type { CreateHOCDevOptions, CreateHOCOptions };

/**
 * @desc - 使用 `defineComponent` 创建一个高阶组件，它可以对被包裹的组件进行状态管
 *
 * 因为实际传递给 `options.component` 的 props 时有这个hook维护的。
 *
 * 注意: 内部传入的state是deeply reactive的, 假如你的某些属性是希望非响应式的，你可以使用 `shallowReadonly` 或 `markRaw` 包裹这个属性, 阻断属性的响应式
 */
export function createHOC<Com extends ComponentType, ComponentRef = unknown>(
  options: CreateHOCOptions<Com, ComponentRef>,
  devOptions?: CreateHOCDevOptions<Com>,
) {
  let { component, ref = shallowRef(null), props = {}, slots } = options;
  const { scope = effectScope(), onConflictProps } = devOptions || {};
  type Props = GetComponentLooseProps<typeof component>;

  let copiedProps = shallowRef(cloneDeep(props));
  const getCopiedProps = () => cloneDeep(unref(copiedProps));
  const setCopiedProps = (newProps: Props) => {
    copiedProps.value = cloneDeep(newProps);
  };

  let mergedState = reactive<Props>(getCopiedProps());
  const Empty = () => null;
  const componentRef = shallowRef<typeof Empty | Com>(Empty);
  const instance = shallowRef(ref);

  const componentFactory = () =>
    defineComponent({
      name: 'HOC',
      inheritAttrs: !!0,
      setup(_, ctx) {
        const setInst = (el: any) => {
          instance.value = el;
        };

        watch(
          () => ctx.attrs,
          (attrs) => {
            const keys = _shallowCheckProps(attrs, mergedState);
            if (__DEV__ && keys.length && onConflictProps) {
              const copiedProps = cloneDeep(mergedState);
              const copiedAttrs = cloneDeep(attrs);
              onConflictProps?.(
                keys.map((key) => ({ key, val: copiedProps[key] })),
                keys.map((key) => ({ key, val: copiedAttrs[key] })),
              );
            }

            Object.assign(mergedState, mergeProps(mergedState, ctx.attrs));
          },
          {
            immediate: !!1,
            deep: !!1,
          },
        );

        const getSlots = () => ({
          ...slots,
          ...ctx.slots,
        });

        const getProps = () => {
          return mergeProps(mergedState, { ref: setInst });
        };
        const getComponent = () => component as DefineComponent;

        tryOnScopeDispose(stop);

        return {
          getComponent,
          getSlots,
          getProps,
        };
      },

      render() {
        return h(this.getComponent(), this.getProps(), this.getSlots());
      },
    }) as typeof component;

  componentRef.value = componentFactory();

  tryOnScopeDispose(stop);

  function stop() {
    scope.stop();

    nextTick(() => {
      restoreState();
      componentRef.value = componentFactory();
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
   * @param mode - 读取模式, 默认返回 `readonly` 的代理对象
   */
  function getState(mode?: 'shallowReadonly' | 'readonly' | 'reactive') {
    const fn = {
      shallowReadonly: shallowReadonly,
      readonly: readonly,

      reactive: reactive,
      undefined: readonly,
    }[mode ?? 'undefined'];
    return fn(mergedState);
  }

  /**
   * 重置组件状态
   *
   * @param _state - 传入一个函数，它会在每次调用 `restoreState` 时执行，它的返回值会被作为新的state
   */
  function restoreState(_state?: Props): void {
    if (!isUndef(_state)) setCopiedProps(toValue(_state));

    for (const k of Object.keys(mergedState)) delete mergedState[k];

    Object.assign(mergedState, getCopiedProps());
  }

  return {
    /** 被包裹的组件，它包裹的组件的状态不仅可以通过它的props进行“透传”，也可以通过`setState`方法进行传递，也可以通过配置options.state传递 */
    HOC: componentRef,

    /** 内部组件的实例 */
    ref: instance,

    /** 获取组件内部状态的只读代理对象 */
    getState,

    /** 设置属性, 两种写法, 传入一整个对象, 则便利这个对象的第一层赋值, 传入 `setState(k,v)` 则根据属性赋值 */
    setState,

    /** 重置组件状态, 你可以传入重置函数, 注意这是一个Getter函数, 因为我不想在这使用cloneDeep */
    restoreState,
  };
}

/**
 * @desc - 检查多个对象的属性是否有冲突, 只检查第一层属性
 * @param args - 传入多个对象，检查它们的属性是否有冲突
 */
function _shallowCheckProps<Props extends object>(...args: Props[]): string[] {
  const conflictKeys = [];
  const keySet = new Set<string>(args.map((arg) => Object.keys(arg)).flat());
  for (const key of keySet) {
    const val = args.map((arg) => key in arg).reduce((a, b) => ~~a + ~~b, 0);
    if (val > 1) {
      conflictKeys.push(key);
    }
  }
  if (conflictKeys.length) {
    if (__DEV__) {
      console.warn(
        `[📦 CreateHOC]: Conflicting props found: ${conflictKeys.join(', ')}. Please declare them in only one place.`,
      );
    }
  }
  return conflictKeys;
}
