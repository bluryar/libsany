import { describe, expect, it } from 'vitest'
import { defineAsyncComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { sleep } from '@bluryar/shared'
import { useComponentWrapper } from '../src'
import WrapperComponent from './fixtures/components/Wrapper.vue'

describe('composable: useComponentWrapper', () => {
  it('should return resolved state', async () => {
    const foo = ref(1)
    const obj = ref({
      test: 1,
    })

    const { Wrapper, getState, invoke } = useComponentWrapper({
      component: WrapperComponent,
      state: () => ({ 'foo': foo.value, 'obj': obj.value, 'onUpdate:obj': (val: any) => obj.value = val }),
    })

    const cmp1 = mount(Wrapper, {
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

    expect(obj.value.test).toEqual(2)
    await cmp1.trigger('click')
    expect(foo.value).toEqual(2)

    invoke(() => ({
      'onUpdate:foo': (val: number) => foo.value = val,
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

    await nextTick()

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

    const { Wrapper, getState, invoke } = useComponentWrapper({
      component: defineAsyncComponent(() => import('./fixtures/components/Wrapper.vue')),
      // 优先级低
      state: () => ({ foo: foo.value, obj: obj.value }),
    })

    const cmp1 = mount(Wrapper, {
      // 优先级最高
      props: {
        'foo': 100,
        'onUpdate:foo': (val: any) => foo.value = val,
        'onUpdate:obj': (val: any) => obj.value = val,
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
  })
})
