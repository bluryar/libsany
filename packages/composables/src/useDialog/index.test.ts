/* eslint-disable vue/no-ref-object-destructure */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineAsyncComponent, defineComponent, h, nextTick, ref, unref } from 'vue'
import { sleep } from '@bluryar/shared'
import { bool, number } from 'vue-types'
import { useVModel } from '@vueuse/core'
import StaticDialog from '../../test/fixtures/components/Dialog.vue'
import { useDialog } from './index'

describe('composable: useDialog', () => {
  it('should open/close dialog by function', async () => {
    const foo = ref(0)
    const obj = ref({
      test: 0,
    })

    const {
      Dialog,
      openDialog,
      closeDialog,
      visible,
      getState: getDialogState,
      setState: setDialogState,
    } = useDialog({
      component: StaticDialog,
      state: () => {
        return {
          'foo': unref(foo),
          'obj': unref(obj),
          'onUpdate:foo': (val: any) => {
            foo.value = val
          },
          'onUpdate:obj': (val: any) => {
            obj.value = val
          },
        }
      },
    })

    const dialog = mount(Dialog as any)

    await nextTick()

    // 打开弹窗
    expect(dialog.find('.fake-dialog-content').exists()).toMatchInlineSnapshot('false')
    expect(dialog.get('.fake-dialog-empty').text()).toMatchInlineSnapshot('""')
    openDialog(() => ({ foo: 2 }))

    await nextTick()
    expect(foo.value).toMatchInlineSnapshot('2')

    expect(dialog.find('.fake-dialog-content').exists()).toMatchInlineSnapshot('true')
    expect(dialog.get('.fake-dialog-content').text()).toMatchInlineSnapshot('"foo: 2 obj.test: 0"')
    expect(visible.value).toBeTruthy()

    // 点击弹窗内部组件
    expect(dialog.get('.fake-dialog-content').get('.use-dialog').text()).toMatchInlineSnapshot('"foo: 2 obj.test: 0"')
    dialog.get('.fake-dialog-content').get('.use-dialog').trigger('click')
    await nextTick()

    expect(dialog.get('.fake-dialog-content').get('.use-dialog').text()).toMatchInlineSnapshot('"foo: 3 obj.test: 1"')
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 2,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": true,
      }
    `)

    // 设置弹窗内部状态

    // 撤销 openDialog 时设置的状态
    setDialogState()
    await nextTick()
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 3,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": true,
      }
    `)

    closeDialog(() => ({ foo: 100 }))
    await nextTick()

    expect(visible.value).toMatchInlineSnapshot('false')

    expect(dialog.text()).toMatchInlineSnapshot('"关闭按钮"')
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 100,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": false,
      }
    `)
    expect(foo.value).toMatchInlineSnapshot('100')

    // 重新打开弹窗，已经设置的内容不会改变
    openDialog()
    await nextTick()
    expect(foo.value).toMatchInlineSnapshot('100')
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 100,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": true,
      }
    `)
  })

  it('should open/close async dialog', async () => {
    const foo = ref(0)
    const obj = ref({
      test: 0,
    })

    const {
      Dialog,
      openDialog,
      closeDialog,
      visible,
      getState: getDialogState,
      setState: setDialogState,
    } = useDialog({
      component: defineAsyncComponent(() => import('../../test/fixtures/components/Dialog.vue')),
      state: () => {
        return {
          'foo': unref(foo),
          'obj': unref(obj),
          'onUpdate:foo': (val: any) => {
            foo.value = val
          },
          'onUpdate:obj': (val: any) => {
            obj.value = val
          },
        }
      },
    })

    const dialog = mount(Dialog as any)

    await nextTick()
    await sleep(10)

    // 打开弹窗
    expect(dialog.find('.fake-dialog-content').exists()).toMatchInlineSnapshot('false')
    expect(dialog.get('.fake-dialog-empty').text()).toMatchInlineSnapshot('""')
    openDialog(() => ({ foo: 2 }))

    await nextTick()
    expect(foo.value).toMatchInlineSnapshot('2')

    expect(dialog.find('.fake-dialog-content').exists()).toMatchInlineSnapshot('true')
    expect(dialog.get('.fake-dialog-content').text()).toMatchInlineSnapshot('"foo: 2 obj.test: 0"')
    expect(visible.value).toBeTruthy()

    // 点击弹窗内部组件
    expect(dialog.get('.fake-dialog-content').get('.use-dialog').text()).toMatchInlineSnapshot('"foo: 2 obj.test: 0"')
    dialog.get('.fake-dialog-content').get('.use-dialog').trigger('click')
    await nextTick()

    expect(dialog.get('.fake-dialog-content').get('.use-dialog').text()).toMatchInlineSnapshot('"foo: 3 obj.test: 1"')
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 2,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": true,
      }
    `)

    // 设置弹窗内部状态

    // 撤销 openDialog 时设置的状态
    setDialogState()
    await nextTick()
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 3,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": true,
      }
    `)

    closeDialog(() => ({ foo: 100 }))
    await nextTick()

    expect(visible.value).toMatchInlineSnapshot('false')

    expect(dialog.text()).toMatchInlineSnapshot('"关闭按钮"')
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 100,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": false,
      }
    `)
    expect(foo.value).toMatchInlineSnapshot('100')

    // 重新打开弹窗，已经设置的内容不会改变
    openDialog()
    await nextTick()
    expect(foo.value).toMatchInlineSnapshot('100')
    expect(getDialogState()).toMatchInlineSnapshot(`
      {
        "foo": 100,
        "obj": {
          "test": 1,
        },
        "onUpdate:foo": [Function],
        "onUpdate:obj": [Function],
        "onUpdate:visible": [Function],
        "visible": true,
      }
    `)
  })

  it('auto mounts and unmounts the component', async () => {
    const MyComponent = defineComponent({
      // template: '<div class="my-component">dialog</div>',

      props: {
        visible: bool().def(false),
        value: number().def(0),
      },

      setup(props) {
        const value = useVModel(props, 'value', undefined, { passive: !!1 })
        const visible = useVModel(props, 'visible', undefined, { passive: !!1 })

        return () =>
          h(
            'div',
            {
              class: 'my-component',
              visible: visible.value,
              onClick: () => {
                value.value = value.value + 1
              },
            },
            h(
              'div',
              {
                class: 'inner',
                onClick: () => {
                  value.value = value.value + 1
                },
              },
              value.value,
            ),
          )
      },
    })

    const { closeDialog, openDialog, destroy, dom, mounted } = useDialog({
      component: MyComponent,
      auto: true,
    })

    openDialog()
    await nextTick()
    expect(mounted.value).toBe(true)

    expect(dom.value).toMatchInlineSnapshot(`
      <div
        class="my-component"
        visible="true"
      >
        <div
          class="inner"
        >
          0
        </div>
      </div>
    `)

    await nextTick()
    expect(document.body.querySelector('.my-component')?.isEqualNode(dom.value)).toBe(true)

    dom.value?.click()
    await nextTick()
    expect(dom.value).toMatchInlineSnapshot(`
      <div
        class="my-component"
        visible="true"
      >
        <div
          class="inner"
        >
          1
        </div>
      </div>
    `)

    const innerDOM = dom.value?.querySelector('.inner')
    // 会事件冒泡
    if (innerDOM)
      (innerDOM as HTMLElement).click()

    await nextTick()
    expect(document.body.querySelector('.my-component')?.isEqualNode(dom.value)).toBe(true)

    await nextTick()
    expect(dom.value).toMatchInlineSnapshot(`
      <div
        class="my-component"
        visible="true"
      >
        <div
          class="inner"
        >
          3
        </div>
      </div>
    `)

    closeDialog(() => ({ value: 100 }))
    await nextTick()
    expect(dom.value).toMatchInlineSnapshot(`
      <div
        class="my-component"
        visible="false"
      >
        <div
          class="inner"
        >
          100
        </div>
      </div>
    `)

    destroy()

    await nextTick()
    expect(document.body.querySelector('.my-component')).toBe(null)
    expect(dom.value).toBe(null)
    expect(mounted.value).toBe(false)
  })
})
