import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref, unref } from 'vue'
import { useDialog } from '../src/useDialog'
import StaticDialog from './fixtures/components/Dialog.vue'

describe('composable: useDialog', () => {
  it('should open/close dialog by function', async () => {
    const foo = ref(0)
    const obj = ref({
      test: 0,
    })

    const { Dialog, openDialog, closeDialog, visible, getState: getDialogState, setState: setDialogState } = useDialog({
      component: StaticDialog,
      state: () => {
        return {
          'foo': unref(foo),
          'obj': unref(obj),
          'onUpdate:foo': (val: any) => foo.value = val,
          'onUpdate:obj': (val: any) => obj.value = val,
        }
      },
    })

    const dialog = mount(Dialog)

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
})
