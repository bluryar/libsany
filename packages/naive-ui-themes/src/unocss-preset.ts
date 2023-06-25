import { parseCssColor, variantMatcher } from '@unocss/preset-mini/utils';
import { type CSSColorValue, type Preset, type Variant, mergeDeep } from 'unocss';
import { commonDark, commonLight } from 'naive-ui';
import { isNil, kebabCase } from 'lodash-es';
import type { BreakpointsType, Theme, UnoTheme as UnoThemeType } from './types';
import * as Breakpoints from './breakpoints';

const PRESET_NAME = 'un-naive-ui-multi-themes';

export interface PresetNaiveThemesOptions<NaiveTheme extends Theme> {
  /**
   * 插件生成的代码被放置在样式文件的哪个位置
   *
   * @deafult 'naive-ui-multi-themes'
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
}

function getSelector<NaiveTheme extends Theme>(themeObj: NaiveTheme, selector: string, attribute: string) {
  const theme = themeObj.name;
  const _selector = selector || '';
  const classNames = ['', ...theme.split('.')].join(' .');
  let mergedSelector = attribute === 'class' ? `${_selector}${classNames}` : `${_selector}[${attribute}="${theme}"]`;
  if (mergedSelector.startsWith(' ')) {
    mergedSelector = mergedSelector.slice(1);
  }
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
    // cssVarPrefix = '',
  } = options;

  const res = themes.map((i) => parseThemes(i, options));

  const variants = res.map((i) => i.variant) as unknown as Variant<UnoTheme>[];
  const codes = res.map((i) => i.code);

  // const concatPrefix = (suffix: keyof ThemeCommonVars) =>
  //   `rgba(var(--${[cssVarPrefix, ...kebabCase(suffix).split('-')].join('-')}), %alpha)`;

  return {
    name: PRESET_NAME,
    variants: variants,
    layers: {
      [layerName]: layerOrder,
    },
    extendTheme(theme) {
      const merged = mergeDeep(theme, {
        // colors: {
        //   base: concatPrefix('primaryColor'),
        //   primary: {
        //     DEFAULT: concatPrefix('primaryColor'),
        //     hover: concatPrefix('primaryColorHover'),
        //     pressed: concatPrefix('primaryColorPressed'),
        //     suppl: concatPrefix('primaryColorSuppl'),
        //   },
        //   info: {
        //     DEFAULT: concatPrefix('infoColor'),
        //     hover: concatPrefix('infoColorHover'),
        //     pressed: concatPrefix('infoColorPressed'),
        //     suppl: concatPrefix('infoColorSuppl'),
        //   },
        //   success: {
        //     DEFAULT: concatPrefix('successColor'),
        //     hover: concatPrefix('successColorHover'),
        //     pressed: concatPrefix('successColorPressed'),
        //     suppl: concatPrefix('successColorSuppl'),
        //   },
        //   warning: {
        //     DEFAULT: concatPrefix('warningColor'),
        //     hover: concatPrefix('warningColorHover'),
        //     pressed: concatPrefix('warningColorPressed'),
        //     suppl: concatPrefix('warningColorSuppl'),
        //   },
        //   error: {
        //     DEFAULT: concatPrefix('errorColor'),
        //     hover: concatPrefix('errorColorHover'),
        //     pressed: concatPrefix('errorColorPressed'),
        //     suppl: concatPrefix('errorColorSuppl'),
        //   },
        //   text: {
        //     DEFAULT: concatPrefix('textColorBase'),
        //     1: concatPrefix('textColor1'),
        //     2: concatPrefix('textColor2'),
        //     3: concatPrefix('textColor3'),
        //     base: concatPrefix('textColorBase'),
        //     disabled: concatPrefix('textColorDisabled'),
        //   },
        //   placeholder: {
        //     DEFAULT: concatPrefix('placeholderColor'),
        //     disabled: concatPrefix('placeholderColorDisabled'),
        //   },
        //   icon: {
        //     DEFAULT: concatPrefix('iconColor'),
        //     hover: concatPrefix('iconColorHover'),
        //     pressed: concatPrefix('iconColorPressed'),
        //     disabled: concatPrefix('iconColorDisabled'),
        //   },
        //   closeicon: {
        //     DEFAULT: concatPrefix('closeIconColor'),
        //     hover: concatPrefix('closeIconColorHover'),
        //     pressed: concatPrefix('closeIconColorPressed'),
        //   },
        //   close: {
        //     hover: concatPrefix('closeColorHover'),
        //     pressed: concatPrefix('closeColorPressed'),
        //   },
        //   clear: {
        //     DEFAULT: concatPrefix('clearColor'),
        //     hover: concatPrefix('clearColorHover'),
        //     pressed: concatPrefix('clearColorPressed'),
        //   },
        //   scrollbar: {
        //     DEFAULT: concatPrefix('scrollbarColor'),
        //     hover: concatPrefix('scrollbarColorHover'),
        //   },
        //   button: {
        //     2: {
        //       DEFAULT: concatPrefix('buttonColor2'),
        //       hover: concatPrefix('buttonColor2Hover'),
        //       pressed: concatPrefix('buttonColor2Pressed'),
        //     },
        //   },
        //   table: {
        //     DEFAULT: concatPrefix('tableColor'),
        //     hover: concatPrefix('tableColorHover'),
        //     striped: concatPrefix('tableColorStriped'),
        //     header: concatPrefix('tableHeaderColor'),
        //   },
        //   input: {
        //     DEFAULT: concatPrefix('inputColor'),
        //     disabled: concatPrefix('inputColorDisabled'),
        //   },
        //   progress: {
        //     rail: concatPrefix('progressRailColor'),
        //   },
        //   rail: concatPrefix('railColor'),
        //   popover: concatPrefix('popoverColor'),
        //   card: concatPrefix('cardColor'),
        //   modal: concatPrefix('modalColor'),
        //   body: concatPrefix('bodyColor'),
        //   tag: concatPrefix('tagColor'),
        //   avatar: concatPrefix('avatarColor'),
        //   inverted: concatPrefix('invertedColor'),
        //   code: concatPrefix('codeColor'),
        //   tab: concatPrefix('tabColor'),
        //   action: concatPrefix('actionColor'),
        //   hover: concatPrefix('hoverColor'),
        //   pressed: concatPrefix('pressedColor'),
        // } as any,
        // boxShadow: {
        //   '1': concatPrefix('boxShadow1'),
        //   '2': concatPrefix('boxShadow2'),
        //   '3': concatPrefix('boxShadow3'),
        // } as any,
      } satisfies UnoThemeType);

      if (typeof breakpoints === 'object') {
        merged.breakpoints = breakpoints;
      } else if (breakpoints) {
        merged.breakpoints = (Breakpoints as any)[`breakpoints${breakpoints}`];
      }

      return merged;
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
