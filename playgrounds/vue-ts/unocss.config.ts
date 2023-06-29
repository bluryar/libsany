import { resolve } from 'path';
import { defineConfig, presetUno } from 'unocss';
import type { UserConfig } from 'unocss';
import { type FileReaderOptions, presetNaiveThemes, tryRemoveThemeVariant } from '@bluryar/naive-ui-themes';
import { createCommonJS } from 'mlly';

const { __dirname } = createCommonJS(import.meta.url);

export const fileReaderOptions = {
  dir: resolve(__dirname, './src/themes'),
  patterns: ['*.(light|dark).(json|js|ts|cjs|mjs)'],
} satisfies FileReaderOptions;

const config = {
  presets: [
    tryRemoveThemeVariant(presetUno()),
    presetNaiveThemes({
      ...fileReaderOptions,
      selector: 'html',
      attribute: 'theme',
      autoimportThemes: !!1,
    }),
  ],
} satisfies UserConfig;

export default defineConfig(config);
