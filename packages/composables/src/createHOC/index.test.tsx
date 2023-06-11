import { mount } from '@vue/test-utils'
import { type PropType, defineComponent, isReactive, isShallow, nextTick, shallowRef } from 'vue'
import { createHOC } from './index'

describe('createHOC', () => {
  const TestComponent = defineComponent({
    props: {
      msg: String,
      obj: {
        type: Object as PropType<{ val: number }>,
      },
    },
    setup(props, { slots }) {
      expect(isShallow(props)).toBe(true)
      expect(isReactive(props)).toBe(true)
      return () => (
        <div>
          <div>{JSON.stringify(props)}</div>
          <div>{{ ...slots }}</div>
        </div>
      )
    },
  })
  it('should create a HOC with the correct properties', async () => {
    const { HOC, setState, getState, ref, restoreState } = createHOC({
      component: TestComponent,
      ref: shallowRef(null),
      initState: () => ({ msg: 'Hello, world!', obj: { val: 1 } }),
    })

    const TESTDOM = mount(HOC.value as any)

    await nextTick()

    expect(HOC.value).toBeDefined()
    expect(ref.value).toBeDefined()
    expect(getState()).toEqual({ msg: 'Hello, world!', obj: { val: 1 } })
    expect(TESTDOM.text()).toBe('{"msg":"Hello, world!","obj":{"val":1}}')

    setState({ msg: 'Foo, Bar!' })

    await nextTick()
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 1 } })
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":1}}')

    setState({ obj: { val: 2 } })

    await nextTick()
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 2 } })
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":2}}')

    setState('obj.val', 3)

    await nextTick()
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 3 } })
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":3}}')

    restoreState()

    await nextTick()
    expect(getState()).toEqual({ msg: 'Hello, world!', obj: { val: 1 } })
    expect(TESTDOM.text()).toBe('{"msg":"Hello, world!","obj":{"val":1}}')

    restoreState(() => ({ msg: 'Hi, world!' }))

    await nextTick()
    expect(getState()).toEqual({ msg: 'Hi, world!' })
    expect(TESTDOM.text()).toBe('{"msg":"Hi, world!"}')
  })
  it('should create a HOC with the slots', async () => {
    const { HOC, setState, getState } = createHOC({
      component: TestComponent,
      ref: shallowRef(null),
      slots: {
        default: () => [<div>{JSON.stringify(getState())}</div>],
      },
      initState: () => ({ msg: 'Hello, world!', obj: { val: 1 } }),
    })

    const TESTDOM = mount(HOC.value as any)

    await nextTick()
    expect(getState()).toEqual({ msg: 'Hello, world!', obj: { val: 1 } })
    expect(TESTDOM.text()).toBe('{"msg":"Hello, world!","obj":{"val":1}}{"msg":"Hello, world!","obj":{"val":1}}')

    setState({ msg: 'Foo, Bar!' })

    await nextTick()
    expect(getState()).toEqual({ msg: 'Foo, Bar!', obj: { val: 1 } })
    expect(TESTDOM.text()).toBe('{"msg":"Foo, Bar!","obj":{"val":1}}{"msg":"Foo, Bar!","obj":{"val":1}}')
  })
})
