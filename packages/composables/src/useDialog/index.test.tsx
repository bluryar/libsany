import { defineComponent, nextTick } from 'vue'
import { useVModel } from '@vueuse/core'
import { mount } from '@vue/test-utils'
import { array } from 'vue-types'
import { isHTMLDivElement } from '@bluryar/shared'
import { useDialog } from './index'

describe('useDialog', () => {
  const VDialog = defineComponent({
    name: 'VDialog',
    props: {
      visible: Boolean,

      formItems: array<{ type: 'select' | 'input'; key: string; prop: any }>(),
    },
    setup(props) {
      const visibleRef = useVModel(props, 'visible', undefined, { passive: !!1 })

      return {
        visibleRef,
      }
    },
    render() {
      const res = (
        <div
          onClick={() => {
            this.visibleRef = !this.visibleRef
          }}
        >
          <div>{this.visibleRef}</div>
          {this.formItems?.map((item) => {
            return <div>{JSON.stringify(item)}</div>
          })}
          {Object.keys(this.$slots).length && this.$slots}
        </div>
      )

      // console.log('🚀 ~ file: index.test.tsx:32 ~ render ~ res:', res)

      return res
    },
  })

  it('should create a dialog instance', async () => {
    const { visible, openDialog, closeDialog, Dialog, getState, restoreState } = useDialog({
      component: VDialog,
      initState: () => ({
        formItems: [{ key: 'index', type: 'input', prop: { val: 1 } } as const],
      }),
    })

    const state = getState()

    const wrapper = mount(Dialog.value as any)

    // 等待下一个tick
    await nextTick()
    expect(visible.value).toBe(false)
    expect(state).toMatchInlineSnapshot(`
      {
        "formItems": [
          {
            "key": "index",
            "prop": {
              "val": 1,
            },
            "type": "input",
          },
        ],
        "onUpdate:visible": [Function],
        "visible": false,
      }
    `)

    // 打开对话框
    openDialog()
    await nextTick()
    expect(visible.value).toBe(true)
    expect(state.visible).toBe(true)

    // 关闭对话框
    closeDialog()
    await nextTick()
    expect(visible.value).toBe(false)
    expect(state.visible).toBe(false);

    // 点击对话框, 通过组件内部的双向绑定设置visible
    (wrapper.element as HTMLDivElement).click()

    await nextTick()
    expect(visible.value).toBe(true)
    expect(state.visible).toBe(true)

    // 打开对话框并传入新的formItems
    openDialog('formItems.2', [
      {
        key: 'index',
        type: 'input',
        prop: { val: 1 },
      },
    ])

    await nextTick()
    expect(visible.value).toBe(true)
    expect(state.visible).toBe(true)
    expect(state.formItems?.length).toBe(3)

    // 恢复对话框状态
    restoreState()
    await nextTick()
    expect(visible.value).toBe(false)
    expect(state.visible).toBe(false)
    expect(state.formItems?.length).toBe(1)
  })

  it('should create a dialog instance, and auto mount it', async () => {
    const {
      visible,
      openDialog,
      closeDialog,
      dom,
      getState,
      restoreState,
      destroy,
      mounted,
      remount,
      ref: refInst,
    } = useDialog({
      component: VDialog,
      initState: () => ({
        formItems: [{ key: 'index', type: 'input', prop: { val: 1 } } as const],
      }),

      auto: !!1,
    })

    const state = getState()

    // 等待下一个tick
    await nextTick()
    expect(mounted.value).toBe(true)
    expect(visible.value).toBe(false)
    expect(state).toMatchInlineSnapshot(`
      {
        "formItems": [
          {
            "key": "index",
            "prop": {
              "val": 1,
            },
            "type": "input",
          },
        ],
        "onUpdate:visible": [Function],
        "visible": false,
      }
    `)
    expect(refInst.value).toBeDefined()

    // 打开对话框
    openDialog()
    await nextTick()
    expect(visible.value).toBe(true)
    expect(state.visible).toBe(true)

    // 关闭对话框
    closeDialog()
    await nextTick()
    expect(visible.value).toBe(false)
    expect(state.visible).toBe(false)

    // 点击对话框
    dom.value?.click()
    await nextTick()
    expect(visible.value).toBe(true)
    expect(state.visible).toBe(true)

    // 打开对话框并传入新的formItems
    openDialog('formItems.2', [
      {
        key: 'index',
        type: 'input',
        prop: { val: 1 },
      },
    ])
    await nextTick()
    expect(visible.value).toBe(true)
    expect(state.visible).toBe(true)
    expect(state.formItems?.length).toBe(3)

    // 恢复对话框状态
    restoreState()
    await nextTick()
    expect(visible.value).toBe(false)
    expect(state.visible).toBe(false)
    expect(state.formItems?.length).toBe(1)
    expect(isHTMLDivElement(dom.value)).toBe(true)

    // 打开对话框并销毁它
    openDialog()
    expect(isHTMLDivElement(dom.value)).toBe(true)
    destroy()
    await nextTick()
    expect(isHTMLDivElement(dom.value)).toBe(false)
    expect(mounted.value).toBe(false)
    expect(dom.value).toBe(null)
    expect(state.visible).toBe(true) // 尽管销毁的DOM, 但是仍然保持它的状态
    expect(visible.value).toBe(true)

    // 重新挂载对话框
    remount()
    await nextTick()

    expect(mounted.value).toBe(true)
    expect(isHTMLDivElement(dom.value)).toBe(true)
    expect(state.visible).toBe(true) // 尽管销毁的DOM, 但是仍然保持它的状态
    expect(visible.value).toBe(true)

    // 打开对话框并销毁它, 然后恢复状态并重新挂载
    openDialog()
    await nextTick()
    destroy()
    restoreState()
    await nextTick()
    remount()
    await nextTick()
    expect(mounted.value).toBe(true)
    expect(isHTMLDivElement(dom.value)).toBe(true)
    expect(state.visible).toBe(false) // 销毁同时重置状态
    expect(visible.value).toBe(false)
  })
})
