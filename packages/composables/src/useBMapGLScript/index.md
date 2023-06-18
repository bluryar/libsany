---
category: Component
---

# 开发文档

本文档提供了关于 `useBMapGLScript` 函数的详细说明，该函数用于动态加载[百度地图 JavaScript API GL](https://lbsyun.baidu.com/index.php?title=jspopularGL)。

## 导入

在使用 `useBMapGLScript` 函数之前，需要先导入相关的模块和依赖项。

```ts
import { type MaybeRef, computed, ref, shallowRef, toValue, unref } from 'vue-demi';
import { uniqueId } from 'lodash-es';
import { defaultDocument, tryOnMounted, useScriptTag, useTimeout } from '@vueuse/core';
```

## 函数签名

```ts
export function useBMapGLScript(options?: UseBMapGLScriptOptions);
```

## 参数

`useBMapGLScript` 函数接受一个可选的 `options` 参数，其类型为 `UseBMapGLScriptOptions` 接口。

### UseBMapGLScriptOptions

`UseBMapGLScriptOptions` 接口定义了 `useBMapGLScript` 函数的配置选项。

```ts
interface UseBMapGLScriptOptions {
  protocol?: MaybeRef<string>;
  ak?: MaybeRef<string>;
  manual?: boolean;
  timeout?: number;
  document?: Document;
}
```

#### protocol

- 类型：`MaybeRef<string>`
- 默认值：`""`

指定加载百度地图 JavaScript API GL 的协议类型。可选值为 `""`（默认值）、`"http"` 或 `"https"`。

#### ak

- 类型：`MaybeRef<string>`
- 默认值：`""`

百度地图开放平台的密钥（AK）。如果未提供 `ak` 参数，将尝试使用全局变量 `BMAP_AK`。

#### manual

- 类型：`boolean`
- 默认值：`false`

是否手动控制脚本加载。当为 `true` 时，需要手动调用 `setup` 函数来加载脚本。

#### timeout

- 类型：`number`
- 默认值：`3000`

脚本加载超时时间，单位为毫秒。

#### document

- 类型：`Document`
- 默认值：`defaultDocument || window.document`

指定要加载脚本的文档对象。如果未提供 `document` 参数，默认使用 `defaultDocument` 或 `window.document`。

## 返回值

`useBMapGLScript` 函数返回一个包含以下属性的对象：

- `loaded`: 是否加载完成的响应式变量（`ref<boolean>`）
- `loading`: 是否正在加载的响应式变量（`ref<boolean>`）
- `error`: 加载错误信息的浅响应式变量（`shallowRef<Error | null>`）
- `setup`: 手动触发加载脚本的函数
- `indexUrl`: 百度地图 JavaScript API GL 的完整 URL（`computed<string>`）
- `fallbackUrl`: 脚本加载失败时的备用 URL（`computed<string>`）

## 例子

### 基本用法

以下是 `useBMapGLScript` 函数的基本用法示例：

```ts
import { useBMapGLScript } from './index';

const { loaded, loading, error, setup, indexUrl, fallbackUrl } = useBMapGLScript({ ak: 'your_ak' });
```

在上面的示例中，我们通过 `useBMapGLScript` 函数创建了一个地图脚本加载的实例。返回的对象中包含了加载状态、错误信息、URL 信息以及手动触发加载的函数。

### 手动加载脚本

如果你想手动控制脚本的加载，可以将 `manual` 参数设置为 `true`，并在需要的时候调用 `setup` 函数：

```ts
const { setup, indexUrl } = useBMapGLScript({ ak: 'your_ak', manual: true });

// 手动触发加载脚本
setup();
```

在上面的示例中，我们将 `manual` 参数设置为 `true`，并在需要加载脚本的时候手动调用了 `setup` 函数。

### 错误处理和超时设置

你可以通过检查 `error` 变量来处理加载过程中的错误信息。此外，你还可以通过 `timeout` 参数设置加载超时时间：

```ts
const { error, loaded, loading } = useBMapGLScript({ ak: 'your_ak', timeout: 5000 });

if (error.value) {
  console.error('加载地图脚本时出现错误:', error.value);
}

if (loading.value && !loaded.value) {
  console.log('正在加载地图脚本...');
} else if (loaded.value) {
  console.log('地图脚本加载完成！');
}
```

在上面的示例中，我们使用了 `error`、`loaded` 和 `loading` 变量来处理加载过程中的错误和状态信息。

## 结论

本文档提供了关于 `useBMapGLScript` 函数的详细说明和示例代码，帮助你理解和使用该函数。如有任何疑问或需要进一步帮助，请随时联系我。
