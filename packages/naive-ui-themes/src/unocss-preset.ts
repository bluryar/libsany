import { parseCssColor, variantMatcher } from '@unocss/preset-mini/utils';
import type { CSSColorValue, Preset, Variant } from 'unocss';
import { commonDark, commonLight } from 'naive-ui';
import { isNil, kebabCase } from 'lodash-es';
import type { Theme } from './types';

const PRESET_NAME = 'naive-ui-multi-themes';

export interface PresetNaiveThemesOptions<NaiveTheme extends Theme> {
  /**
   * 插件生成的代码被放置在样式文件的哪个位置
   *
   * @deafult 'naive-ui-multi-themes'
   */
  layerName?: string;

  /**
   * 最终生成CSS代码位于layer
   *
   * @default -10
   */
  layerOrder?: number;

  /**
   * 主题配置列表
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
}

function getSelector<NaiveTheme extends Theme>(themeObj: NaiveTheme, selector: string, attribute: string) {
  const theme = themeObj.name;
  const _selector = selector || '';
  const classNames = ['.', ...theme.split('.')].join(' ');
  const mergedSelector = attribute === 'class' ? `${_selector}${classNames}` : `${_selector}${attribute}=${theme}`;
  return { theme, mergedSelector };
}

function parseThemes<NaiveTheme extends Theme>(theme: NaiveTheme, options: PresetNaiveThemesOptions<NaiveTheme>) {
  const { selector = 'html', attribute = 'class', layerName = PRESET_NAME, cssVarPrefix = '' } = options;

  const colorMap = new Map<string, CSSColorValue>();

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

      const { type, components, alpha } = parsedColor;
      rules += `--${kebabCase(cssVarPrefix + '-' + key)}-${type}: ${components.join(', ')};`;
      if (!isNil(alpha)) {
        rules += `--${kebabCase(cssVarPrefix + '-' + key)}-${type}-alpha: ${alpha};`;
      }
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
    variant,
    code,
  };
}

export function presetNaiveThemes<NaiveTheme extends Theme, UnoTheme extends object = {}>(
  options: PresetNaiveThemesOptions<NaiveTheme> = {},
): Preset<UnoTheme> {
  const {
    themes = [
      { name: 'light', isDark: false, themeOverride: {} },
      { name: 'dark', isDark: true, themeOverride: {} },
    ],
    layerName = PRESET_NAME,
    layerOrder = -10,
  } = options;

  const res = themes.map((i) => parseThemes(i, options));

  const variants = res.map((i) => i.variant) as unknown as Variant<UnoTheme>[];
  const codes = res.map((i) => i.code);

  return {
    name: PRESET_NAME,
    variants: variants,
    layers: {
      [layerName]: layerOrder,
    },
    preflights: [
      {
        layer: layerName,
        getCSS() {
          // 注入css变量
          return codes.join('\n');
        },
      },
    ],
  };
}
