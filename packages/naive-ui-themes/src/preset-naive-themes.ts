import {
  CSSEntries,
  type Preset,
  type Variant,
  VariantHandlerContext,
  VariantObject,
  definePreset,
  escapeRegExp,
  mergeDeep,
} from 'unocss';
import { h } from '@unocss/preset-mini/utils';
import _ from 'lodash';
import { ThemeCommonVars, commonDark, commonLight } from 'naive-ui';
import tinycolor from 'tinycolor2';
import { unsafeModuleLoaderSync } from './module-loader';
import type { PresetNaiveThemesOptions, Theme, UnoTheme as UnoThemeType } from './types';
import * as Breakpoints from './breakpoints';
import { getSelector, wrapCssVarKey } from './utils';

export * from './try-remove-theme-variant';

const PRESET_NAME = 'un-naive-ui-multi-themes';

/**
 * 适配naive-ui的主题配置, 提供以下三个功能
 * - variants, 即使用 `dark:(text-primary)` 的语法来控制主题
 * - preflight, 即向 虚拟模块 `uno.css` 中插入 naive-ui 主题相关的 css vars 声明
 * - extendTheme, 即扩展 uno 主题预设, 使得你可以使用 `bg-primary hover:text-success-hover` 等这些uno的规则
 *
 * 此预设建议搭配 `tryRemoveThemeVariant` 使用: @see tryRemoveThemeVariant
 */
export function presetNaiveThemes<_NaiveTheme_ extends Theme, _UnoTheme_ extends UnoThemeType = {}>(
  options: PresetNaiveThemesOptions<_NaiveTheme_> = {},
): Preset<_UnoTheme_> {
  let {
    themes = [
      { name: 'light', isDark: false, themeOverrides: {} },
      { name: 'dark', isDark: true, themeOverrides: {} },
    ],
    layerName = PRESET_NAME,
    layerOrder = 0,
    breakpoints = 'AntDesign',
    cssVarPrefix = '',
    preflight = true,
    extendTheme = true,
    autoimportThemes = false,
    dir,
    patterns,
    esbuild,
  } = options;

  if (autoimportThemes) {
    const { themes: _themes, files: _files } = unsafeModuleLoaderSync({ dir, patterns, esbuild });
    themes = Array.from(_themes);
  }

  const innerLightTheme = parseThemes(
    { name: 'light', isDark: !!0, themeOverrides: { common: commonLight } } as any,
    options,
    !!1,
  );
  const innerDarkTheme = parseThemes(
    { name: 'dark', isDark: !!1, themeOverrides: { common: commonDark } } as any,
    options,
    !!1,
  );

  const parsedRes = [innerLightTheme, innerDarkTheme, ...themes.map((i) => parseThemes(i, options))];

  const layers: Record<string, number> = {
    default: 1,
    [layerName]: layerOrder,
  };

  const preflights = [
    {
      layer: layerName,
      getCSS: () => (preflight ? parsedRes.map((i) => i.code).join('\n') : undefined),
    },
  ];
  const variants = parsedRes.map((i) => i.variants).flat(1) as unknown as Variant<_UnoTheme_>[];

  return definePreset({
    name: PRESET_NAME,

    variants,

    layers,

    preflights,

    extendTheme: (theme: _UnoTheme_) => {
      const isExtenable = preflight && extendTheme;
      if (!isExtenable) {
        return theme;
      }
      // 合并不同主题的颜色相关的变量, 用于扩展主题, 比如 `bg-primary`
      // 由于不同主题都有这个token, 因此无法给定一个特定值, 只能传入一个 css 变量 `var(--primary-color-value)`
      const allColorCssVarValueMap: Map<string, `${string}(${string})`> = parsedRes
        .map((i) => new Map(Array.from(i.colorMap).map(([key, { rgbVars }]) => [key, rgbVars])))
        .reduce((prev, curr) => new Map([...prev, ...curr]), new Map());

      const themeColors = parsedRes.map(({ colorMap, themeName }) => {
        const map = new Map(Array.from(colorMap).map(([key, { value }]) => [key, value]));

        return getColorsRecord(map, (path) => `theme.${_.kebabCase(themeName).replaceAll('-', '.')}.${path}`);
      });
      const colors = [getColorsRecord(allColorCssVarValueMap), ...themeColors].reduce(
        (prev, curr) => mergeDeep(prev, curr),
        {},
      );

      const customTheme = {
        colors,
        boxShadow: {
          '1': `var(${wrapCssVarKey(cssVarPrefix, 'boxShadow1')})`,
          '2': `var(${wrapCssVarKey(cssVarPrefix, 'boxShadow2')})`,
          '3': `var(${wrapCssVarKey(cssVarPrefix, 'boxShadow3')})`,
        } as any,
      } satisfies UnoThemeType;

      const merged = mergeDeep(theme, customTheme);

      if (typeof breakpoints === 'object') {
        merged.breakpoints = transformBreakpoints(breakpoints);
      } else if (breakpoints) {
        merged.breakpoints = transformBreakpoints((Breakpoints as any)[`breakpoints${breakpoints}`]);
      }

      return merged;
    },
  });
}

function transformBreakpoints(breakpoints: Record<string, number>): Record<string, string> | undefined {
  return Object.fromEntries(Object.entries(breakpoints).map(([key, value]) => [key, `${value}px`])) as any;
}

/**
 * 生成插入css样式表的preflight规则， 主要是将naive的配置转换成css规则
 */
function getColorsRecord(
  colorCssVarValueMap: Map<string, string>,
  transformKey: (path: string) => string = (input) => input,
): Record<string, string> {
  const placeholder = '@@@@@@@@@@@@@@@@@@';

  return [...colorCssVarValueMap.keys()]
    .map((key, _, list) => {
      if (list.some((i) => i.startsWith(key) && i !== key)) {
        return key + placeholder;
      }
      return key;
    })
    .reduce((prev, key) => {
      let _key = key;

      if (_key.endsWith(placeholder)) {
        _key = _key.replace(placeholder, 'Default');
      }

      let path = _.kebabCase(_key).replaceAll('-', '.').replace('.color', '');
      if (path.endsWith('default')) {
        path = path.replace('.default', '.DEFAULT');
      }

      const value = colorCssVarValueMap.get(key.replace(placeholder, ''));

      _.setWith(prev, transformKey(path), value, Object);
      return prev;
    }, {});
}

/**
 * 解析配置项和主题配置文件得到中间过程中使用的各种信息
 */
function parseThemes<NaiveTheme extends Theme>(
  theme: NaiveTheme,
  options: PresetNaiveThemesOptions<NaiveTheme>,
  inner = false,
) {
  const { selector = 'html', attribute = 'class', layerName = PRESET_NAME, cssVarPrefix = '' } = options;

  const common: Partial<ThemeCommonVars> = {
    ...(theme?.themeOverrides?.common || {}),
  };

  const mergedCommon = {
    ...(theme.name.endsWith('dark') ? commonDark : commonLight),
    ...common,
  };

  let { mergedSelector } = getSelector(theme, selector || 'html', attribute || 'class');

  // 内置设置, 解析 commonLight 和 commonDark 来作为公共的配置样式, 以减少preflight的体积
  if (inner) {
    const targetName = ['light', 'dark'].find((i) => i === theme.name);
    if (targetName) {
      if (attribute === 'class') {
        mergedSelector = `.${targetName}`;
      } else {
        mergedSelector = `[${attribute}*="${targetName}"]`;
      }
    }
  }

  const { rules, colorMap } = getCssRules(common, cssVarPrefix);

  const code = `${mergedSelector} {${rules.join('')}}`;

  const getVariant = (name = theme.name) => {
    let re: RegExp;
    return {
      name,
      multiPass: !!1,
      order: inner ? Infinity : undefined,
      match(input, ctx) {
        if (!re) re = new RegExp(`^${escapeRegExp(name)}(?:${ctx.generator.config.separators.join('|')})`);

        const match = input.match(re);
        if (match) {
          return {
            matcher: input.slice(match[0].length),
            body: genVariantBody(cssVarPrefix, mergedCommon, input),
            handle: (input, next) =>
              next({
                ...input,
                ...({
                  prefix: `${mergedSelector} $$ ${input.prefix}`,
                  layer: layerName,
                } satisfies Partial<VariantHandlerContext>),
              }),
          };
        }
      },
      autocomplete: `${name}:`,
    } satisfies VariantObject;
  };

  const variants = [getVariant(theme.name), getVariant(`[${theme.name}]`)];

  return {
    themeName: theme.name,
    mergedCommon,
    selector: mergedSelector,
    colorMap,
    variants: variants,
    code,
  };
}

/**
 * 生成变体的body， body可以覆盖原有rule的生成
 * @param cssVarPrefix 前缀
 * @param mergedCommon 合并后的common变量
 * @param input 待匹配的用户输入 - default.dark:bg-primary/50%
 */
function genVariantBody(
  cssVarPrefix: string,
  mergedCommon: ThemeCommonVars,
  input: string,
): ((body: CSSEntries) => CSSEntries | undefined) | undefined {
  return (body) => {
    let mayByColorRecord = body?.find?.(
      ([key, value]) => key?.endsWith?.('color') && (value as string)?.startsWith?.('var(--'),
    );
    if (mayByColorRecord) {
      const [name, value] = mayByColorRecord;
      if (_.isString(value)) {
        // 获取原始key, 即从用户主题配置文件获取的key
        let [, key = ''] = value.match(/^var\(--(.+)\)/) || [];
        // eg: var(--${maybeWithPrefix}-primary-color) => primaryColor
        key = _.camelCase(key.replace(cssVarPrefix, ''));

        let targetValue = (mergedCommon as any)[key];
        if (targetValue) {
          const split = input?.split(/(?:\/|:)/) || [];
          let { r, g, b, a } = tinycolor(targetValue).toRgb();
          let coverAlpha: any = h.bracket.percent.cssvar(split[split.length - 1]);

          coverAlpha = Number(_.isNil(coverAlpha) || Number.isNaN(coverAlpha) ? a : coverAlpha);

          const entries = [
            ['--un-theme-opacity', Number.isNaN(coverAlpha) ? a : coverAlpha],
            [name, `rgba(${r},${g},${b},var(--un-theme-opacity))`],
          ] satisfies CSSEntries;

          return entries;
        }
      }
    }
    return body;
  };
}

function getCssRules(common: Partial<ThemeCommonVars & { [k: string]: any }>, cssVarPrefix: string) {
  type ThemeName = string;
  const colorMap = new Map<
    ThemeName,
    { value: string; rgbVars: string; rgba: string; getCSSEntries: (attrName: string) => CSSEntries }
  >();

  const rules = Object.entries(common).map(([key, value]) => {
    let rules = `--${_.kebabCase(cssVarPrefix + '-' + key)}: ${value};`;
    const color = tinycolor(value);

    if (/color/gi.test(key) && color.isValid()) {
      const { r, g, b, a } = color.toRgb();
      const transformColor = color.toRgbString().toLowerCase();
      rules = `${wrapCssVarKey(cssVarPrefix, key)}: ${transformColor};`;

      colorMap.set(key, {
        value: color.toRgbString().toLowerCase(),
        rgbVars: `var(${wrapCssVarKey(cssVarPrefix, key)})`,
        rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
        getCSSEntries: (attrName) => [
          ['--un-theme-opacity', a],
          [attrName, `rgba(${r},${g},${b},var(--un-theme-opacity))`],
        ],
      });
    }

    return rules;
  });

  return {
    rules,
    colorMap,
  };
}
