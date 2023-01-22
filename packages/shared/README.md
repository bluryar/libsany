# ⚙️ @bluryar/shared

[🧑bluryar](https://github.com/bluryar) 自用工具函数合集

## 用法 / Usage

1. **安装**

```bash
pnpm add @bluryar/shared
```

2. **引用**

__path/to/code.{js|ts}__
```ts
import { isMap, isNil } from '@bluryar/shared'

// return true
isMap(new Map())

// return true
isNil(undefined)
```

## 特性 / Features

- 🔰 类型安全 - TS 开发，利用 `is` 关键字保证 `isXxx` 在 TS 中自动机进行类型收窄， 避免不必要的 `as` 。
- ✌️ 纯函数 - 不带副作用，方便进行 tree-shaking。
- ⚡ 单元测试 - 每个函数都进行基本的单元测试， 保证可用性。

## 为什么不用 `lodash`

这个库不为替代 `lodash`， 仅用于作者平时开发用到的一些常用函数， 部分函数也许在其他库中也有， 但是作者懒得去翻各个工具库的文档， 有些简单的就自己写了。
