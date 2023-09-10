import { mount } from '@vue/test-utils';
import { type PropType, defineComponent, isReactive, isShallow, nextTick, reactive, ref, shallowRef } from 'vue-demi';
import { describe, expect, it } from 'vitest';
import { createHOC } from './index';

describe('createHOC', () => {
  const TestComponent = defineComponent({
    props: {
      msg: String,
      obj: {
        type: Object as PropType<{ val: number }>,
      },
    },
    setup(props, { slots }) {
      expect(isShallow(props)).toBe(true);
      expect(isReactive(props)).toBe(true);
      return () => (
        <div>
          <div>{JSON.stringify(props)}</div>
          <div>{{ ...slots }}</div>
        </div>
      );
    },
  });
  it('should create a HOC with the correct properties', async () => {
    const { HOC, setState, getState, ref } = createHOC({
      component: TestComponent,
      ref: shallowRef(null),
      props: () => ({ msg: 'Hello, world!', obj: reactive({ val: 1 }) }),
    });

    const TESTDOM = mount(HOC as any);

    // 测试 HOC 是否被正确创建
    await nextTick();
    expect(HOC).toBeDefined();
    expect(ref.value).toBeDefined();

    // 测试 getState 是否能够正确获取 state
    expect(getState()).toEqual({ msg: 'Hello, world!', obj: { val: 1 } });

    // 测试组件是否能够正确渲染
    expect(TESTDOM.text()).toBe('{"msg":"Hello, world!","obj":{"val":1}}');

    // 测试 setState 是否能够正确更新 state
    setState({ msg: 'Foo, Bar!' });
    await nextTick();
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 1 } });
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":1}}');

    // 测试 setState 是否能够正确更新 state 的嵌套属性
    setState({ obj: reactive({ val: 2 }) });
    await nextTick();
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 2 } });
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":2}}');

    // 测试 setState 是否能够正确更新 state 的嵌套属性
    setState('obj.val', 3);
    await nextTick();
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 3 } });
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":3}}');
  });

  it('should create a HOC with the slots', async () => {
    const { HOC, setState, getState } = createHOC({
      component: TestComponent,
      ref: shallowRef(null),
      slots: {
        default: () => [<div>{JSON.stringify(getState())}</div>],
      },
      props: () => ({ msg: 'Hello, world!', obj: { val: 1 } }),
    });

    const TESTDOM = mount(HOC as any);

    // 测试 getState 是否能够正确获取 state
    await nextTick();
    expect(getState()).toEqual({ msg: 'Hello, world!', obj: { val: 1 } });

    // 测试组件是否能够正确渲染
    expect(TESTDOM.text()).toBe('{"msg":"Hello, world!","obj":{"val":1}}{"msg":"Hello, world!","obj":{"val":1}}');

    // 测试 setState 是否能够正确更新 state
    setState({ msg: 'Foo, Bar!' });
    await nextTick();
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 1 } });
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":1}}{"msg":"Foo, Bar!","obj":{"val":1}}');
  });

  it('should create a HOC with the reactive props', async () => {
    const counter = ref(0);
    const inst = ref();
    const { HOC, setState, getState } = createHOC({
      component: TestComponent,
      ref: shallowRef(null),
      slots: {
        default: () => [<div>{JSON.stringify(getState())}</div>],
      },
      props: () => ({
        msg: 'Hello, world!',
        obj: { val: counter.value },
      }),
    });
    const TESTDOM = mount(HOC as any);

    await nextTick();
    expect(TESTDOM.text()).toBe('{"msg":"Hello, world!","obj":{"val":0}}{"msg":"Hello, world!","obj":{"val":0}}');
    await nextTick();
    counter.value++;
    await nextTick();
    expect(TESTDOM.text()).toBe('{"msg":"Hello, world!","obj":{"val":1}}{"msg":"Hello, world!","obj":{"val":1}}');
  });
});
