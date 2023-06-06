/* eslint-disable vue/no-ref-object-destructure */
import { describe, expect, it } from 'vitest'
import { defineAsyncComponent, defineComponent, nextTick, ref, unref } from 'vue'
import { mount } from '@vue/test-utils'
import { sleep } from '@bluryar/shared'
import WrapperComponent from '../../test/fixtures/components/Wrapper.vue'
import { createHOC } from './index'

describe('composable: createHOC', () => {
  it('should return resolved state', async () => {
    const foo = ref(1)
    const obj = ref({
      test: 1,
    })

    const { HOC: Wrapper, getState, setState: invoke, state } = createHOC({
      component: WrapperComponent,
      state: () => ({ 'foo': foo.value, 'obj': obj.value, 'onUpdate:obj': (val: any) => { obj.value = val } }),
    })

    const cmp1 = mount(Wrapper as any, {
      props: {},
    })

    await sleep(1)
    foo.value = 2
    await nextTick()

    expect(cmp1.text()).toMatchInlineSnapshot('"foo: 2obj.test: 1"')
    await cmp1.trigger('click')
    expect(cmp1.text()).toMatchInlineSnapshot('"foo: 3obj.test: 2"')
    expect(foo.value).toEqual(2)
    // 被绑定的组件内部状态的变更是由于其维护的是ref变量
    // 但是由于外部没有`v-model`进行双向绑定所以不会变更外部状态以及hook作用域内的状态
    expect(getState().foo).toBe(foo.value)
    expect(unref(state).foo).toBe(foo.value)

    expect(obj.value.test).toEqual(2)
    await cmp1.trigger('click')
    expect(foo.value).toEqual(2)

    invoke(() => ({
      'onUpdate:foo': (val: number) => { foo.value = val },
    }))

    await nextTick()
    await cmp1.trigger('click')
    expect(cmp1.text()).toMatchInlineSnapshot('"foo: 5obj.test: 4"')
    // 补充双向绑定，使得外部状态被同步
    expect(foo.value).toEqual(5)

    expect(getState()).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 4,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)
    expect(unref(state)).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 4,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)

    obj.value.test += 1

    expect(getState()).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 5,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)
    expect(unref(state)).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 5,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)
    await nextTick()

    expect({ foo: foo.value, obj: obj.value }).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 5,
        },
      }
    `)

    cmp1.unmount()

    await nextTick()
    await nextTick()

    expect(unref(state)).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 5,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)
    expect(getState()).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 5,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)
    expect({ foo: foo.value, obj: obj.value }).toMatchInlineSnapshot(`
      {
        "foo": 5,
        "obj": {
          "test": 5,
        },
      }
    `)
  })

  it('should mount async component and sync resolved state', async () => {
    const foo = ref(1)
    const obj = ref({
      test: 1,
    })

    const { HOC: Wrapper, getState, setState: invoke, state } = createHOC({
      component: defineAsyncComponent(() => import('../../test/fixtures/components/Wrapper.vue')),
      // 优先级低
      state: () => ({ foo: foo.value, obj: obj.value }),
    })

    const cmp1 = mount(Wrapper as any, {
      // 优先级最高
      props: {
        'foo': 100,
        'onUpdate:foo': (val: any) => { foo.value = val },
        'onUpdate:obj': (val: any) => { obj.value = val },
      },
    })

    await sleep(10)

    expect(cmp1.text()).toMatchInlineSnapshot('"foo: 100obj.test: 1"')

    invoke(() => ({
      foo: 10,
    }))

    await nextTick()

    expect(cmp1.text()).toMatchInlineSnapshot('"foo: 100obj.test: 1"')

    expect(getState()).toMatchInlineSnapshot(`
      {
        "foo": 100,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)

    obj.value.test += 1

    await nextTick()
    expect(cmp1.text()).toMatchInlineSnapshot('"foo: 100obj.test: 2"')
    expect(getState()).toMatchInlineSnapshot(`
      {
        "foo": 100,
        "obj": {
          "test": 2,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)
    expect(unref(state)).toMatchInlineSnapshot(`
      {
        "foo": 100,
        "obj": {
          "test": 2,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
      }
    `)
  })

  it('should allow merging state with stateMerge', async () => {
    const TestComponent = defineComponent({
      props: {
        foo: String,
        bar: Number,
        formItems: Array,
      },
      template: '<div>{{ foo }} {{ bar }} {{ formItems }}</div>',
    })

    const foo = ref('hello')
    const bar = ref(42)

    interface FormItem {type: 'input'| 'select'| 'radio'}

    const setFormItems = (val: FormItem[], ivkState: FormItem[], cmpState: FormItem[]) => {
      return [...(val || []), ...(ivkState || []), ...(cmpState || [])]
    }
    const { HOC: Wrapper, getState, setState, state } = createHOC({
      component: TestComponent,
      state: () => ({
        foo: foo.value,
        bar: bar.value,
        formItems: [{
          type: 'select',
        }],
      }),
      stateMerge: {
        formItems: setFormItems,
      },
    })

    const wrapper = mount(Wrapper as any, {
      props: {
        formItems: [
          { type: 'input' },
        ],
      },
    })

    await nextTick()

    expect(wrapper.text()).toMatchInlineSnapshot(`
      "hello 42 [
        {
          \\"type\\": \\"select\\"
        },
        {
          \\"type\\": \\"input\\"
        }
      ]"
    `)

    setState({
      formItems: [
        { type: 'radio' },
      ],
    })

    await nextTick()

    // 合并顺序
    /* select radio input */
    expect(wrapper.text()).toMatchInlineSnapshot(`
      "hello 42 [
        {
          \\"type\\": \\"select\\"
        },
        {
          \\"type\\": \\"radio\\"
        },
        {
          \\"type\\": \\"input\\"
        }
      ]"
    `)
  })
})
