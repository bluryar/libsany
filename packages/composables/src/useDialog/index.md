---
category: Component
related: createHOC
---

# useDialog

假设你的业务弹窗都是直接基于AModal封装的，那么你可以使用这个方法来简化你的代码。

因为你在使用这些二次封装的 `AModal` 的时候通常需要传入 `visible` 控制弹窗，并且通常需要传入一个业务相关的字段，暂且称作 `vo`。`vo` 通常是用户进行鼠标调集等交互后传入的。

以往，你通常需要在使用这个二次封装的弹窗时，重复定义 `visible` 和 `vo`, 然后在 `template` 中传入。

为了减少定义这些无意义的字段，所以我们提供了这个方法，它可以帮助你简化这些代码。

**注意**：假设你的弹窗都是只封装 ModalContent, 那么显然你不需要使用这个hook。某些组件库也会提供一个通用的 `useDialog`，来做类似的事情，并且它可以自动挂载组件。

## Usage

分为两种模式：手动挂载和自动挂载

### 1. 手动挂载

_dialog.vue_
```vue
<script setup lang="ts">
import { bool, object } from "vue-types"

const props = defineProps({
  visible: bool().def(false),
  vo: object().def({}),
})

const formData = ref()
const visible = useVModel(props, 'visible', undefined, { passive: true })
const voId = computed(() => props.vo.id)
const { data, runAsync, loading } = useRequest(() => getVo(voId.value), {
  onSuccess: (data) => {
    visible.value = true
    formData.value = data
  },
})
</script>

<template>
  <AModal v-model:visible="visible">
    <AForm :model="formData"></AForm>
  </AModal>
</template>
```

_bussiness.vue_
```vue
<script setup lang="tsx">
const { data, loading } = useRquest(() => getVoList())
import { useDialog } from '@bluryar/composables'

const Dialog = useDialog({
  component: defineAsyncComponent(() => import('./dialog.vue')),
  state: {}
})

const columns = [
  // ...
  {
    title: 'operation',
    dataIndex: 'operation',
    render: (record) => {
      const { id } = record
      return (
        <a
          onClick={() => {
            // 打开弹窗。并且传入vo
            Dialog.openDialog({ vo: record })
          }}
        >
          编辑
        </a>
      )
    },
  }
]
</script>

<template>
  <ATable :data-source="data" :loading="loading" :columns="columns"></ATable>
  <Dialog.Dialog></Dialog.Dialog>
</template>
```

### 2. 自动挂载

当传入配置项 `auto` 为true时，会自动挂载组件，这样你就不需要在模板中手动挂载了。

**注意**：自动挂载模式基于 vue 的 `render` 函数实现， 那些不在 main.ts 中使用 `app.provide` 注入的内容，是无法在自动挂载模式中使用的。

_bussiness.vue_
```vue
<script setup lang="tsx">
const { data, loading } = useRquest(() => getVoList())
import { useDialog } from '@bluryar/composables'

const Dialog = useDialog({
  component: defineAsyncComponent(() => import('./dialog.vue')),
  state: {},

  auto: true, // <-- 自动挂载
})

Dialog.destroy() // <-- 销毁弹窗，等同于 v-if="false"
<script>
```

- 自动挂载模式下，Dialog.Dialog 不再返回
