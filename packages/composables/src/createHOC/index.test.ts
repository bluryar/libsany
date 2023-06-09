import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, shallowRef } from 'vue'
import { createHOC } from './index'

describe('createHOC', () => {
  it('should create a HOC with the correct properties', async () => {
    const TestComponent = defineComponent({
      props: {
        msg: String,
      },
      template: '<div>{{ msg }}</div>',
    })

    const { HOC, state, ref } = createHOC({
      component: TestComponent,
      ref: shallowRef(null),
      initState: ({ msg: 'Hello, world!' }),
    })

    const TESTDOM = mount(HOC.value as any)

    await nextTick()

    expect(HOC.value).toBeDefined()
    expect(state.value).toEqual({ msg: 'Hello, world!' })
    expect(ref.value).toBeDefined()
    expect(TESTDOM.text()).toBe('Hello, world!')

    await nextTick()
    state.value = { msg: 'Foo, Bar!' }
    expect(HOC.value).toBeDefined()
    expect(state.value).toEqual({ msg: 'Foo, Bar!' })
    expect(ref.value).toBeDefined()
    expect(TESTDOM.text()).toBe('Foo, Bar!')
  })
})
