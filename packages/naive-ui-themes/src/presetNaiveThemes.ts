import { parseCssColor, variantMatcher } from '@unocss/preset-mini/utils';
import { type CSSColorValue, type Preset, type Variant, definePreset, mergeDeep } from 'unocss';
import _ from 'lodash';
import { commonDark, commonLight } from 'naive-ui';
import { unsafeFileReaderSync } from './fileReader';
import type { PresetNaiveThemesOptions, Theme, UnoTheme as UnoThemeType } from './types';
import * as Breakpoints from './breakpoints';
import { getSelector, withoutAlphaColorType, wrapCssVarKey } from './utils';

export * from './tryRemoveThemeVariant';

const PRESET_NAME = 'un-naive-ui-multi-themes';

/**
 * 适配naive-ui的主题配置, 提供以下三个功能
 * - variants, 即使用 `dark:(text-primary)` 的语法来控制主题
 * - preflight, 即向 虚拟模块 `uno.css` 中插入 naive-ui 主题相关的 css vars 声明
 * - extendTheme, 即扩展 uno 主题预设, 使得你可以使用 `bg-primary hover:text-success-hover` 等这些uno的规则
 *
 * 其中生成 variants 是基础功能, 无法关闭
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
    layerOrder = 1,
    breakpoints = 'NaiveUI',
    cssVarPrefix = '',
    preflight = true,
    extendTheme = true,
    autoimportThemes = false,
    dir,
    patterns,
  } = options;

  if (autoimportThemes) {
    const { themes: _themes, files: _files } = unsafeFileReaderSync({ dir, patterns });
    themes = Array.from(_themes);
  }

  const parsedRes = themes.map((i) => parseThemes(i, options));
  const colorMap: Map<string, `${string}(${string})`> = parsedRes
    .map((i) => i.unoThemeColorMap)
    .reduce((prev, curr) => new Map([...prev, ...curr]), new Map());
  const variants = parsedRes.map((i) => i.variant) as unknown as Variant<_UnoTheme_>[];
  const codes = parsedRes.map((i) => i.code);

  return definePreset({
    name: PRESET_NAME,
    variants: variants,
    layers: {
      default: 1,
      [layerName]: layerOrder,
    },
    extendTheme: (theme: _UnoTheme_) => {
      const isExtenable = preflight && extendTheme;
      if (!isExtenable) {
        return theme;
      }
      const placeholder = '@@@@@@@@@@@@@@@@@@';
      const colors = [...colorMap.keys()]
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

          _.setWith(prev, path, colorMap.get(key.replace(placeholder, '')), Object);
          return prev;
        }, {});

      const customTheme = {
        colors: colors,
        boxShadow: {
          '1': `var(${wrapCssVarKey(cssVarPrefix, 'boxShadow1')})`,
          '2': `var(${wrapCssVarKey(cssVarPrefix, 'boxShadow2')})`,
          '3': `var(${wrapCssVarKey(cssVarPrefix, 'boxShadow3')})`,
        } as any,
      } satisfies UnoThemeType;

      const merged = mergeDeep(theme, customTheme);

      if (typeof breakpoints === 'object') {
        merged.breakpoints = breakpoints as any;
      } else if (breakpoints) {
        merged.breakpoints = (Breakpoints as any)[`breakpoints${breakpoints}`];
      }

      return merged;
    },

    preflights: [
      {
        layer: layerName,
        getCSS: () => (preflight ? codes.join('\n') : undefined),
      },
    ],
  });
}

function parseThemes<NaiveTheme extends Theme>(theme: NaiveTheme, options: PresetNaiveThemesOptions<NaiveTheme>) {
  const { selector = 'html', attribute = 'class', layerName = PRESET_NAME, cssVarPrefix = '' } = options;

  const colorMap = new Map<string | string, CSSColorValue>();
  const unoThemeColorMap = new Map<string | string, `${string}(${string})`>();

  const { isDark } = theme;
  const shareDcommon = isDark ? commonDark : commonLight;
  const mergedCommon = {
    ...shareDcommon,
    ...theme.themeOverrides.common,
  };

  const { mergedSelector } = getSelector(theme, selector || 'html', attribute || 'class');

  const cssRules = Object.entries(mergedCommon).map(([key, value]) => {
    const parsedColor = parseCssColor(value);
    let rules = `--${_.kebabCase(cssVarPrefix + '-' + key)}: ${value};`;
    if (parsedColor) {
      colorMap.set(key, parsedColor);

      const { type, components } = parsedColor;
      rules += `${wrapCssVarKey(cssVarPrefix, key, 'value')}: ${components.join(', ')};`;

      unoThemeColorMap.set(key, `${withoutAlphaColorType(type)}(var(${wrapCssVarKey(cssVarPrefix, key, 'value')}))`);
    }

    return rules;
  });

  const code = `${mergedSelector} {${cssRules.join('')}}`;

  console.log('🚀 ~ file: presetNaiveThemes.ts:152 ~ mergedSelector:', mergedSelector);
  const variant = variantMatcher(theme.name, (input) => {
    const res = {
      selector: `${mergedSelector} ${input.selector}`,
      layer: layerName,
    };

    return res;
  });

  return {
    mergedCommon,
    selector: mergedSelector,
    colorMap,
    unoThemeColorMap: unoThemeColorMap,
    variant,
    code,
  };
}
