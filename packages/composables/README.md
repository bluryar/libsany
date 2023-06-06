# @bluryar/composables

一个 Vue3 的 composables 库，补充一些 vueuse 没有的 composables。这些 composables 多为业务开发时常用的一些功能，比如弹窗、表单、地图等。

## Install

```bash
npm install @bluryar/composables
```

## Usage

```js
import { useDialog } from '@bluryar/composables'

const { Dialog, openDialog } = useDialog({
  component: defineAsyncComponent(() => import('./dialog.vue')),
  state: {},
})
```
