---
category: Component
related: createHOC
---

# usePopup

```typescript
useDialog<Com extends ComponentType, ComponentRef = unknown>(
  options: UseDialogOptions<Com, ComponentRef>,
): UseDialogReturn<Com, ComponentRef>
```

## 说明

该函数用于创建一个对话框实例，并提供对话框的状态管理和控制方法。提供两种使用方式, 当参数 `auto = true` 时, 自动挂载对话框组件到 DOM 中, 否则需要手动挂载。

### 参数

- `options`: 对话框选项对象，包含以下属性：
  - `component`: 对话框组件类型，必需。
  - `initState`: 初始化状态的函数，可选。默认为一个返回空对象的函数。
  - `visibleKey`: 可选。弹出双向绑定的属性名，默认为 `'visible'`。
  - `auto`: 可选。是否自动挂载组件，默认为 `false`。
  - `to`: 可选。组件挂载的 DOM 元素或返回 DOM 元素的函数，默认为 `document.body`。
  - `appContext`: 可选。`appContext` 对象，默认为 `getCurrentInstance().appContext`。

### 返回值

`UseDialogReturn<Com, ComponentRef>`，包含以下属性和方法：

- `visible`: `Ref<boolean>`，是否显示对话框。
- `openDialog`: `SetState<Com>`，打开对话框的方法。
- `closeDialog`: `SetState<Com>`，关闭对话框的方法。
- `Dialog`: 对话框组件。
- `restoreState`: `(state?: () => Props) => void`，重置组件状态的方法。接受一个函数作为参数，该函数会在每次调用 `restoreState` 时执行，返回值将作为新的状态。
- `destroy`: `() => void`，销毁对话框的方法。仅在 `auto` 为 `true` 时可用。
- `remount`: `() => void`，重新挂载对话框的方法。仅在 `auto` 为 `true` 时可用。
- `mounted`: `ComputedRef<boolean>`，组件是否已挂载的计算属性。
- `dom`: `ShallowRef<HTMLElement | null>`，对话框组件的 DOM 元素的浅响应引用。

## 用法示例

```typescript
import { useDialog } from './index';

const {
  visible,
  openDialog,
  closeDialog,
  // Dialog, // 当 `auto = true` 时, 不返回 Dialog 组件
  restoreState,
  destroy,
  remount,
  mounted,
  dom,
} = useDialog({
  component: MyDialogComponent,
  initState: () => ({
    formItems: [{ key: 'index', type: 'input', prop: { val: 1 } }],
  }),
  auto: true,
});

// 调用对话框的方法
openDialog();
closeDialog();

// 获取对话框状态
console.log(visible.value);

// 获取对话框组件
console.log(Dialog);

// 重置组件状态
restoreState();

// 销毁对话框
destroy();

// 重新挂载对话框
remount();

// 获取组件是否已挂载
console.log(mounted.value);

// 获取对话框组件的 DOM 元素
console.log(dom.value);
```
