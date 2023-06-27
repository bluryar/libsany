import { parseCssColor, variantMatcher } from '@unocss/preset-mini/utils';
import { type CSSColorValue, type Preset, type Variant, mergeDeep, presetMini, presetUno } from 'unocss';
import { type ThemeCommonVars, commonDark, commonLight } from 'naive-ui';
import { kebabCase, setWith } from 'lodash-es';
import type { BreakpointsType, Theme, UnoTheme as UnoThemeType } from './types';
import * as Breakpoints from './breakpoints';
import { getSelector, withoutAlphaColorType, wrapCssVarKey } from './utils';

const PRESET_NAME = 'un-naive-ui-multi-themes';

export interface PresetNaiveThemesOptions<NaiveTheme extends Theme> {
  /**
   * 插件生成的代码被放置在样式文件的哪个位置
   *
   * @deafult 'un-naive-ui-multi-themes'
   */
  layerName?: string;

  /**
   * 最终生成CSS代码的位置
   *
   * @default -10
   */
  layerOrder?: number;

  /**
   * 主题配置列表
   *
   * - 推荐使用这个包导出的 `fileReader` 读取文件夹下的所有主题文件
   * - 它的读取逻辑与 `vite-plugin-naive-ui-multi-theme` 一致
   */
  themes?: NaiveTheme[];

  /**
   * 主题 对应的类名\属性 被应用的选择器
   *
   * @default 'html'
   */
  selector?: string;

  /**
   * 主题是使用类名还是属性
   *
   * @default 'class'
   */
  attribute?: string;

  /**
   * css变量前缀
   *
   * @default ''
   */
  cssVarPrefix?: string;

  /**
   * 屏幕尺寸断点
   *
   * @default 'NaiveUI'
   */
  breakpoints?: BreakpointsType | Record<string, number>;

  /**
   * 是否向 `uno.css` 中插入根据 `theme` 生成的 css vars 声明, 关闭此项, 如果你更希望自己控制naive的这些css变量
   *
   * @default true
   * */
  preflight?: boolean;

  /**
   * 是否扩展uno主题预设, 默认将根据传入 `theme` 来扩展, 假如 `preflight=false` 则此项配置失效
   *
   * @default true
   */
  extendTheme?: boolean;

  /**
   * 是否删除 presetMini 和 presetWind 的 light\.light\@light 等默认的variant
   *
   * 默认不开启
   *
   * 当你确定会使用 dark 和 light 作为主题相关的variant时， 设置为 true 可以避免原本应该传递给本预设的 variants 的rules 被其他预设的 variants "拦截"
   *
   * @default false
   */
  removeDefaultThemeVariant?: boolean;
}

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
export function presetNaiveThemes<NaiveTheme extends Theme, UnoTheme extends UnoThemeType = {}>(
  options: PresetNaiveThemesOptions<NaiveTheme> = {},
): Preset<UnoTheme> {
  const {
    themes = [
      { name: 'light', isDark: false, themeOverride: {} },
      { name: 'dark', isDark: true, themeOverride: {} },
    ],
    layerName = PRESET_NAME,
    layerOrder = -10,
    breakpoints = 'NaiveUI',
    cssVarPrefix = '',
    preflight = true,
    extendTheme = true,
    removeDefaultThemeVariant = false,
  } = options;

  const parsedRes = themes.map((i) => parseThemes(i, options));
  const colorMap: Map<keyof ThemeCommonVars, `${string}(${string})`> = parsedRes
    .map((i) => i.unoThemeColorMap)
    .reduce((prev, curr) => new Map([...prev, ...curr]), new Map());
  const variants = parsedRes.map((i) => i.variant) as unknown as Variant<UnoTheme>[];
  const codes = parsedRes.map((i) => i.code);

  return {
    name: PRESET_NAME,
    variants: variants,
    enforce: 'post',
    layers: {
      [layerName]: layerOrder,
    },
    extendTheme: preflight && extendTheme ? getExtendTheme<UnoTheme>(cssVarPrefix, colorMap, breakpoints) : undefined,
    preflights: preflight
      ? [
          {
            layer: layerName,
            getCSS() {
              // 注入css变量
              return codes.join('\n');
            },
          },
        ]
      : undefined,
    // options: {
    //   themes: [
    //     { name: 'light', isDark: false, themeOverride: {} },
    //     { name: 'dark', isDark: true, themeOverride: {} },
    //   ],
    //   layerName: PRESET_NAME,
    //   layerOrder: -10,
    //   breakpoints: 'NaiveUI',
    //   cssVarPrefix: '',
    //   preflight: true,
    //   extendTheme: true,
    //   selector: 'html',
    //   attribute: 'class',
    //   removeDefaultThemeVariant: false,
    // },
    configResolved: (userconfig) => {
      if (removeDefaultThemeVariant) {
        tryRemoveThemeVariant(userconfig as any);
      }
    },
  };
}

/**
 * 工具方法, 尝试删除冲突的variant
 * @param preset 期望被删除冲突variant的预设
 */
export function tryRemoveThemeVariant(preset: ReturnType<typeof presetUno> | ReturnType<typeof presetMini>) {
  const removeableVariants = ['light', '.light', '@light', 'dark', '.dark', '@dark'];

  const { variants } = preset;
  if (variants) {
    removeableVariants.forEach((variant) => {
      const idx = variants.findIndex(({ name }) => name === variant);
      if (idx !== -1) {
        variants.splice(idx, 1);
      }
    });
  }

  return preset;
}

function getExtendTheme<UnoTheme extends UnoThemeType = {}>(
  cssVarPrefix: string,
  colorMap: Map<string, `${string}(${string})`>,
  breakpoints: string | Record<string, number>,
) {
  return (theme: UnoTheme) => {
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

        let path = kebabCase(_key).replaceAll('-', '.').replace('.color', '');
        if (path.endsWith('default')) {
          path = path.replace('.default', '.DEFAULT');
        }

        setWith(prev, path, colorMap.get(key.replace(placeholder, '')), Object);
        return prev;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      }, {} as Record<string, string>);

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
      merged.breakpoints = breakpoints;
    } else if (breakpoints) {
      merged.breakpoints = (Breakpoints as any)[`breakpoints${breakpoints}`];
    }

    return merged;
  };
}

function parseThemes<NaiveTheme extends Theme>(theme: NaiveTheme, options: PresetNaiveThemesOptions<NaiveTheme>) {
  const { selector = 'html', attribute = 'class', layerName = PRESET_NAME, cssVarPrefix = '' } = options;

  const colorMap = new Map<keyof ThemeCommonVars | string, CSSColorValue>();
  const unoThemeColorMap = new Map<keyof ThemeCommonVars | string, `${string}(${string})`>();

  const { isDark } = theme;
  const shareDcommon = isDark ? commonDark : commonLight;
  const mergedCommon = {
    ...shareDcommon,
    ...theme.themeOverride.common,
  };

  const { mergedSelector } = getSelector(theme, selector || 'html', attribute || 'class');

  const cssRules = Object.entries(mergedCommon).map(([key, value]) => {
    const parsedColor = parseCssColor(value);
    let rules = `--${kebabCase(cssVarPrefix + '-' + key)}: ${value};`;
    if (parsedColor) {
      colorMap.set(key, parsedColor);

      const { type, components } = parsedColor;
      rules += `${wrapCssVarKey(cssVarPrefix, key, 'value')}: ${components.join(', ')};`;

      unoThemeColorMap.set(key, `${withoutAlphaColorType(type)}(var(${wrapCssVarKey(cssVarPrefix, key, 'value')})})`);
    }

    return rules;
  });

  const code = `${mergedSelector} {${cssRules.join('')}}`;

  const variant = variantMatcher(theme.name, (input) => ({
    prefix: `${mergedSelector} $$ ${input.prefix}`,
    layer: layerName,
  }));

  return {
    mergedCommon,
    selector: mergedSelector,
    colorMap,
    unoThemeColorMap: unoThemeColorMap,
    variant,
    code,
  };
}
