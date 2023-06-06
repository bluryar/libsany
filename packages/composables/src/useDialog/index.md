---
category: Component
related: createHOC
---

# createHOC

假设你的业务弹窗都是直接基于AModal封装的，那么你可以使用这个方法来简化你的代码。

因为你在使用这些二次封装的 `AModal` 的时候通常需要传入 `visible` 控制弹窗，并且通常需要传入一个业务相关的字段，暂且称作 `vo`。`vo` 通常是用户进行鼠标调集等交互后传入的。

以往，你通常需要在使用这个二次封装的弹窗时，重复定义 `visible` 和 `vo`, 然后在 `template` 中传入。

为了减少定义这些无意义的字段，所以我们提供了这个方法，它可以帮助你简化这些代码。

**注意**：假设你的弹窗都是只封装 ModalContent, 那么显然你不需要使用这个hook。某些组件库也会提供一个通用的 `useDialog`，来做类似的事情，并且它可以自动挂载组件。

## Usage

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
