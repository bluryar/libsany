# @bluryar/naive-ui-themes

这是一个围绕 [naive-ui](https://github.com/tusen-ai/naive-ui) 开发的插件库, 面向后台管理系统开发过程中的多主题切换场景.

- 涉及的依赖库: Vite, UnoCss, VueUse, naive-ui

## 背景

假如你的后台管理系统需要实现多主题切换, 那么选择 naive-ui 作为你的组件库是很好的, 基于 Vue 3 的 [依赖注入](https://cn.vuejs.org/guide/components/provide-inject.html) 和 [CSS Variable](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties) 可以很方便的实现多主题切换.

naive-ui 通过 [`<NConfigProvider>`](https://www.naiveui.com/zh-CN/os-theme/docs/customize-theme) 提供 `lightTheme` 和 `darkTheme` 作为主题的基础, 然后你可以通过配置 `themeOverrides` 来实现自定义主题.

但是, 当你尝试应用 [UnoCSS](https://unocss.dev/) 作为 CSS 样式方案时, 你会发现 UnoCSS 的 [PresetMini](https://unocss.dev/presets/mini#dark) 只提供了 `light` 和 `dark` 两种主题规则是生成预设, 而 VueUse 的 [useDark](https://vueuse.org/core/useDark/#usedark) 也只提供了 `dark` 和 `light` 两种主题切换的方法, 这就限制了使用场景.

> **Why Not `Color-Schema` ?**
>
> 这里假设你使用 UnoCss 和 VueUse 的上述两个方案时, 选择的使用方式是给 `<body>` 或者 `<html>` 添加类名 `light` 或者 `dark`.
> 为什么不使用 [color-schema](https://developer.mozilla.org/zh-CN/docs/Web/CSS/color-scheme) 和 [@media prefer-color-scheme](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-color-scheme)?
>
> 首先这两个属性的兼容型一般, 其次, color-schema 的可选值有限. 最后, 切换类名或者 html attribute 的方式可以很方便的实现多主题切换, 笔者暂未遇到没有非 color-schema 不可的场景.
>
> 简而言之, 切换 class 或者 HTML attributes 的方式, 使用简单, 兼容性好, **可控性强**.

## 解决方法

为了解决上述问题, 我们先要扩展 `UnoCSS` 的生成规则, 然后再扩展 `VueUse` 的 `useColorMode` 方法.

### UnoCSS 扩展变体

原有的 dark variant 源码:

```ts
import type { Variant } from '@unocss/core';
import type { PresetMiniOptions } from '..';
import { variantMatcher, variantParentMatcher } from '../utils';

export function variantColorsMediaOrClass(options: PresetMiniOptions = {}): Variant[] {
  if (options?.dark === 'class' || typeof options.dark === 'object') {
    const { dark = '.dark', light = '.light' } = typeof options.dark === 'string' ? {} : options.dark;

    return [
      variantMatcher('dark', (input) => ({ prefix: `${dark} $$ ${input.prefix}` })),
      variantMatcher('light', (input) => ({ prefix: `${light} $$ ${input.prefix}` })),
    ];
  }

  return [
    variantParentMatcher('dark', '@media (prefers-color-scheme: dark)'),
    variantParentMatcher('light', '@media (prefers-color-scheme: light)'),
  ];
}
```

我们只需要模仿一下成这样:

```ts
import type { Variant, PresetMiniOptions } from '@unocss/core';
import { variantMatcher } from '@unocss/core';

export function variantMultiColorsClass(options: PresetMiniOptions = {}): Variant[] {
  const { themes = ['light', 'dark'], selector = 'html', attribute = 'class', layer } = options;

  return themes.map((theme) => {
    const _selector = selector || '';
    const classNames = ['.', ...theme.split('.')].join(' ');
    const mergedSelector = attribute === 'class' ? `${_selector}${classNames}` : `${_selector}${attribute}=${theme}`;
    return variantMatcher(theme, (input) => ({ prefix: `${mergedSelector} $$ ${input.prefix}`, layer }));
  });
}
```

### VueUse 改用 useColorMode

> 是的, "改用", 这里假设你之前使用的是 `useDark` 这个方法.

_src/hooks/useThemes.ts_

```ts
import type { GlobalThemeOverrides } from 'naive-ui';
import { useColorMode } from '@vueuse/core';
import { lightTheme, darkTheme } from 'naive-ui';
import { themes } from '~naive-ui-themes'; // fake code

type ThemeType = 'light' | 'dark' | 'other';
type Theme = { name: ThemeType; isDark: boolean; themeOverrides: GlobalThemeOverrides };
// typeof themes extends Theme[]

// other 是你自定义的主题, 他的取值可以是 default.light, default.dark, 或者其他你自定义的主题
const modes = themes.map(({ name }) => ({ [name]: name.split('.').join(' ') }));

const useThemes = (initTheme = 'light') => {
  const colorMode = useColorMode({
    selector: 'html',
    attribute: 'class',
    initialValue: initTheme,
    modes,
    disableTransition: !!1, // 临时关闭切换主题时的所以transition, 需要过场动画需要另外实现
  });

  const setTheme = (theme: ThemeType) => {
    colorMode.value = theme;
  };

  const isDark = computed(() => modes[colorMode.value].isDark);
  const naiveTheme = computed(() => (isDark.value ? darkTheme : lightTheme));
  const naiveThemeOverrides = computed(() => modes[colorMode.value].themeOverrides);

  return {
    setTheme,
    isDark,
    naiveTheme,
    naiveThemeOverrides,
  };
};
```

之后, 你就可以在你的项目中使用 `useThemes` 这个 hook 来切换主题, 实现多主题切换了.

## themeOverides 的来源

在上面的代码中, 我们的配置下通过一个 [虚拟模块](https://cn.vitejs.dev/guide/api-plugin.html#virtual-modules-convention) 导入:

```ts
import { themes } from '~naive-ui-themes'; // fake code
```

这便是本插件期望完成的工作:

1. 约定式主题配置
2. 自动生成主题配置
3. 提供 VSCode 对于主题配置文件的智能提示
4. 提供主题配置文件的类型定义

### 约定式主题配置

为了集中管理主题配置, 我们约定主题配置文件的路径为 `src/themes/*.json`, 这些 JSON 文件导出一个数组, 数组的每一项为一个主题配置对象, 该对象的结构如下:

```ts

```
