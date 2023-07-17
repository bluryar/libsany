import { defineComponent, nextTick } from 'vue-demi';
import { describe, expect, it } from 'vitest';
import { array } from 'vue-types';
import { useVModel } from '@vueuse/core';
import { useAutoMount } from './index';

describe('useAutoMount', () => {
  const VDialog = defineComponent({
    name: 'VDialog',
    props: {
      visible: Boolean,

      formItems: array<{ type: 'select' | 'input'; key: string; prop: any }>(),
    },
    setup(props) {
      const visibleRef = useVModel(props, 'visible', undefined, { passive: !!1 });

      return {
        visibleRef,
      };
    },
    render() {
      const res = (
        <div
          id="dialog"
          onClick={() => {
            this.visibleRef = !this.visibleRef;
          }}
        >
          <div>{this.visibleRef}</div>
          {this.formItems?.map((item) => {
            return <div>{JSON.stringify(item)}</div>;
          })}
          {Object.keys(this.$slots).length && this.$slots}
        </div>
      );

      return res;
    },
  });

  it('should auto mount component', async () => {
    const { mount, destroy, mounted } = useAutoMount({
      component: VDialog,
    });

    await nextTick();
    expect(document.querySelector('#dialog')).not.toBeNull();
    expect(mounted.value).toBe(true);

    destroy();
    await nextTick();
    expect(document.querySelector('#dialog')).toBeNull();
    expect(mounted.value).toBe(false);

    mount();
    await nextTick();
    expect(document.querySelector('#dialog')).not.toBeNull();
  });

  it('should auto mount component to custom mount point', async () => {
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);

    expect(document.querySelector('#app')).not.toBeNull();

    const { mount, destroy, mounted } = useAutoMount({
      component: VDialog,
      to() {
        return app;
      },
      vIf: !!0,
    });

    mount();
    await nextTick();
    expect(document.querySelector('#app #dialog')).not.toBeNull();
    expect(mounted.value).toBe(true);

    destroy();
    await nextTick();
    expect(document.querySelector('#app #dialog')).toBeNull();
    expect(mounted.value).toBe(false);

    mount();
    await nextTick();
    expect(document.querySelector('#app #dialog')).not.toBeNull();
  });
});
