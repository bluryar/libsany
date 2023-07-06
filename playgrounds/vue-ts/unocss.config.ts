import { resolve } from 'path';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import type { UserConfig } from 'unocss';
import { type ModuleLoaderOptions, presetNaiveThemes, tryRemoveThemeVariant } from '@bluryar/naive-ui-themes';
import { createCommonJS } from 'mlly';
import { presetScrollbar } from 'unocss-preset-scrollbar';

const { __dirname } = createCommonJS(import.meta.url);

export const selectorOptions = {
  selector: 'html',
  attribute: 'class',
};

export const fileReaderOptions = {
  dir: resolve(__dirname, './src/themes'),
  patterns: ['*.(light|dark).(json|js|ts|cjs|mjs)'],
} satisfies ModuleLoaderOptions;

const config = {
  warn: !!1,

  shortcuts: [
    // size
    /* 正方形 */ [/^(wh|square)-([a-zA-Z0-9var\[\]-]*)$/, ([, , c]) => `w-${c} h-${c}`],
    /* 圆形 */ [/^circle-([a-zA-Z0-9var\[\]-]*)$/, ([, c]) => `wh-${c} rounded-full`],

    // flex
    ['flex-center', 'flex justify-center items-center'],
    [
      /^(inline-flex|flex)-(x|y)-(center|between|around|start|end|baseline|stretch|evenly)$/,
      ([, type, direction, behavior]) => {
        const res = `${type} ${direction === 'x' ? 'justify-' : 'items-'}${behavior}`;
        return res;
      },
    ],

    ['absolute-center', 'absolute top-50% left-50% translate-y--50% translate-x--50%'],

    ['scrollable', 'scrollbar scrollbar-rounded'],
  ],

  presets: [
    tryRemoveThemeVariant(presetUno()),

    presetNaiveThemes({
      ...fileReaderOptions,
      ...selectorOptions,
      autoimportThemes: !!1,
    }),

    presetAttributify(),

    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      // scale: 1.2,
      warn: true,
    }),

    // 滚动条
    presetScrollbar({
      scrollbarTrackColor: 'var(--scrollbar-track-color)',
      scrollbarThumbColor: 'var(--scrollbar-thumb-color)',
      scrollbarWidth: 'var(--scrollbar-width)',
      scrollbarHeight: 'var(--scrollbar-height)',
      scrollbarTrackRadius: 'var(--scrollbar-track-radius)',
      scrollbarThumbRadius: 'var(--scrollbar-thumb-radius)',
      varPrefix: 'inner',
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: [],
} satisfies UserConfig;

export default defineConfig(config);
