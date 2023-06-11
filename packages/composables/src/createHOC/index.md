# createHOC

```typescript
createHOC<Com extends ComponentType, ComponentRef = unknown>(
  options: CreateHOCOptions<Com, ComponentRef>,
  devOptions?: CreateHOCDevOptions,
): {
  HOC: ShallowRef<typeof Empty | Com>,
  ref: ShallowRef<ComponentRef | null>,
  getState: (mode?: 'shallowReadonly' | 'readonly' | 'reactive') => any,
  setState: {
    (key: keyof Partial<Prettify<ComponentExternalProps<Com>>>, val: any): void,
    (key: string, val: any): void,
    (state: Partial<Prettify<ComponentExternalProps<Com>>>): void,
  },
  restoreState: (state?: () => Partial<Prettify<ComponentExternalProps<Com>>>) => void,
}
```

## 说明

该函数用于创建一个高阶组件，可以对被包裹的组件进行状态管理。

### 参数

- `options`: 高阶组件的选项对象，包含以下属性：
  - `component`: 需要处理的组件，必需。
  - `ref`: 组件的引用，可选，默认为 `null`。
  - `initState`: 初始化状态的函数，可选。默认为一个返回空对象的函数。
  - `slots`: 代理插槽，可选。默认为 `undefined`。
- `devOptions`: 开发选项对象，包含以下属性：
  - `scope`: 作用域对象，可选。

### 返回值

一个对象，包含以下属性和方法：

- `HOC`: 组件的浅响应引用。
- `ref`: 组件的引用。
- `getState`: 获取只读代理对象的方法，可以传入读取模式，默认为 `'readonly'`。
- `setState`: 设置属性的方法，可以传入属性键和属性值，也可以传入一个对象。
- `restoreState`: 重置组件状态的方法，可以传入一个重置函数。

## 用法示例

```typescript
import { createHOC } from './index';

const {
  HOC,
  ref,
  getState,
  setState,
  restoreState,
} = createHOC({
  component: MyComponent,
  ref: shallowRef(null),
  initState: () => ({ msg: 'Hello, world!', obj: { val: 1 } }),
});

// 获取组件的引用
console.log(ref.value);

// 获取组件的状态
console.log(getState());

// 设置组件的属性
setState('msg', 'Foo, Bar!');
setState({ obj: { val: 2 } });

// 重置组件状态
restoreState();

// 重置组件状态并传入新的状态
restoreState(() => ({ msg: 'Hi, world!' }));
```
