import {
  computed,
  createCommentVNode,
  createVNode,
  effectScope,
  getCurrentInstance,
  ref,
  render,
  shallowRef,
  toValue,
  unref,
  watch,
} from 'vue-demi';
import type { ComponentType } from '../types';
import type { UseSetupRenderOptions } from './types';

export type * from './types';

export function useAutoMount<Com extends ComponentType>(options: UseSetupRenderOptions<Com>) {
  const { to = () => document.body, appContext, component, vIf = true, scope = effectScope() } = options;

  const instance = getCurrentInstance();
  const container = shallowRef<HTMLElement | DocumentFragment | null>(document.createDocumentFragment());
  const vnode = shallowRef<ReturnType<typeof createVNode> | null>(null);
  const dom = shallowRef<HTMLElement | null>(null);
  const isMounted = ref(!!0);
  const displayVIf = ref(vIf);

  const resolvedTo = () => toValue(to) || document.body;

  function _mount() {
    if (component) {
      // create
      container.value = document.createDocumentFragment();
      vnode.value = createVNode(component);
      vnode.value.appContext = toValue(appContext) || instance?.appContext || vnode.value.appContext;
      const provides = Object.create(
        (instance as any)?.provides || (instance?.parent as any)?.provides || (instance?.root as any)?.provides || {},
      );
      vnode.value.appContext = !instance
        ? null
        : {
            ...(vnode.value.appContext as any),
            provides,
          };

      render(vnode.value, container.value as unknown as HTMLElement);

      // mount
      dom.value = vnode.value.el as HTMLElement;
      toValue(resolvedTo).appendChild(container.value);
      isMounted.value = !!1;
    }
  }

  function _destroy() {
    if (component) {
      // unmount
      render(null, container.value as unknown as HTMLElement);
      container.value!.parentNode?.removeChild(container.value!);
      vnode.value = createCommentVNode('v-if', true);
      vnode.value?.component?.update();

      // update
      dom.value = vnode.value.el as HTMLElement;
      container.value = document.createDocumentFragment();
      isMounted.value = !!0;
    }
  }

  scope.run(() => {
    watch(
      displayVIf,
      (val) => {
        if (val) {
          _mount();
        } else {
          _destroy();
        }
      },
      { immediate: !!1 },
    );
  });

  return {
    dom,
    vnode,
    mounted: computed(() => !!unref(isMounted)),
    vIf: displayVIf,
    mount: _mount,
    destroy: _destroy,
  };
}
