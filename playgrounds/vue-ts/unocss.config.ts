import { defineConfig, presetUno } from 'unocss';
import type { UserConfig } from 'unocss';
import { type FileReaderOptions, presetNaiveThemes, tryRemoveThemeVariant } from '@bluryar/naive-ui-themes';

export const fileReaderOptions = {
  dir: './src/themes',
  patterns: ['*.(light|dark).(json|js|ts|cjs|mjs)'],
} satisfies FileReaderOptions;

const config = {
  presets: [
    tryRemoveThemeVariant(presetUno()),
    presetNaiveThemes({
      ...fileReaderOptions,
      autoimportThemes: !!1,
    }),
  ],
} satisfies UserConfig;

export default defineConfig(config);
